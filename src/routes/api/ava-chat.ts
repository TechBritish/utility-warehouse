import { createFileRoute } from "@tanstack/react-router";

import { buildSiteKnowledge } from "@/lib/site-knowledge";
import { VAPI_GUIDE_ASSISTANT_ID } from "@/lib/vapi-config";

// Typed chat with Ava. Runs on the server so the Vapi private key (Vercel env
// var VAPI_PRIVATE_KEY) never reaches the browser.

const TEXT_MODE = `

YOU ARE IN TEXT CHAT, NOT A VOICE CALL
- The visitor is typing to you in the chat box. Reply in writing: short, friendly, plain British English, one to three sentences.
- Skip the spoken-style opener reactions; just answer naturally.
- You cannot move the page, scroll or highlight in text chat. Tell them where to tap instead, e.g. "Tap Sign in at the top of the page."
- To reach Sheila, tell them to tap "Book a chat with Sheila" in this panel, or "Free bill check" at the top of the home page to leave their details.
- Everything else (who you are, the three paths, the help section and every rule) still applies.`;

export const Route = createFileRoute("/api/ava-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.VAPI_PRIVATE_KEY;
        if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

        let body: { input?: unknown; previousChatId?: unknown; path?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "bad_request" }, { status: 400 });
        }
        const input = typeof body.input === "string" ? body.input.trim().slice(0, 1000) : "";
        if (!input) return Response.json({ error: "empty" }, { status: 400 });
        const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";
        const previousChatId =
          typeof body.previousChatId === "string" && /^[\w-]{8,64}$/.test(body.previousChatId)
            ? body.previousChatId
            : undefined;

        const res = await fetch("https://api.vapi.ai/chat", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            assistantId: VAPI_GUIDE_ASSISTANT_ID,
            input,
            ...(previousChatId ? { previousChatId } : {}),
            assistantOverrides: {
              model: {
                provider: "openai",
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: buildSiteKnowledge(path) + TEXT_MODE }],
              },
            },
          }),
        });
        if (!res.ok) {
          console.error("Vapi chat failed", res.status, await res.text().catch(() => ""));
          return Response.json({ error: "upstream" }, { status: 502 });
        }
        const chat = (await res.json()) as { id?: string; output?: { role: string; content?: string }[] };
        const reply = (chat.output ?? [])
          .filter((m) => m.role === "assistant" && m.content)
          .map((m) => m.content)
          .join("\n")
          .trim();
        return Response.json({ chatId: chat.id ?? null, reply: reply || "Sorry, I didn't catch that. Could you try again?" });
      },
    },
  },
});
