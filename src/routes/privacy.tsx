import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/uw/SiteHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy notice | Partner Coach" },
      {
        name: "description",
        content: "How Partner Coach collects, uses and protects your personal information.",
      },
    ],
  }),
  component: PrivacyPage,
});

const CONTACT = "john.and.sheila@uw.partners";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who looks after your information",
    body: (
      <>
        <p>
          Partner Coach is run for John and Sheila Gwillam-Winter's UW Partner team. Sheila
          Gwillam-Winter is responsible for the personal information collected through this site
          (the "data controller"). British AI Consulting builds and maintains the site on her
          behalf.
        </p>
        <p>
          Partner Coach is independent. It is not operated by Utility Warehouse Limited, and
          information you give here is not shared with UW through this site.
        </p>
      </>
    ),
  },
  {
    title: "What we collect",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Your name and email address.</li>
        <li>Your password, which is stored securely and is never visible to us.</li>
        <li>The experience level you choose when you sign up.</li>
        <li>Your training activity: modules completed, badges earned and practice sessions.</li>
        <li>
          Practice session details: how long each session lasted, any rating, and the written
          transcript of what was said.
        </li>
      </ul>
    ),
  },
  {
    title: "Website visits and cookies",
    body: (
      <>
        <p>
          We record the pages people visit, the site they came from, and whether they're on a phone,
          tablet or computer, so we can see how the site is used and improve it.
        </p>
        <p className="mt-2">
          If you choose "Accept" on the cookie banner, we also store a random ID in your browser so we
          can count returning visitors. If you choose "No thanks", no ID is stored. You can change your
          mind any time by clearing this site's data in your browser.
        </p>
      </>
    ),
  },
  {
    title: "Voice conversations",
    body: (
      <p>
        When you talk to Ava or the practice coach, your voice is processed in real time by our
        voice technology providers so the AI can understand and reply. Transcripts of practice
        sessions on the trainer page are saved to your account so you can review them.
        Conversations with Ava, the site guide, are not saved to your account. Our voice provider may keep its own call records for a limited time to run and secure its service.
      </p>
    ),
  },
  {
    title: "How we use it",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>To give you your account and track your training progress.</li>
        <li>
          So Sheila can see how her team is getting on with training and offer support where it
          helps.
        </li>
        <li>To keep the site working and secure.</li>
      </ul>
    ),
  },
  {
    title: "Why we're allowed to use it",
    body: (
      <p>
        We rely on your consent, which you give when you create your account. You can withdraw it
        at any time by asking us to delete your account.
      </p>
    ),
  },
  {
    title: "Who else handles it",
    body: (
      <>
        <p>
          We use trusted service providers to run the site: Vercel (website hosting), Supabase
          (accounts and database) and Vapi with its AI and voice partners (voice conversations).
          They process information only to provide their service to us.
        </p>
        <p>
          Some of these providers may process information outside the UK, using the safeguards
          required by UK data protection law. We don't sell your information or use it for
          advertising.
        </p>
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <p>
        We keep your information while your account is active. If you ask us to delete your
        account, we delete your details and training records.
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        <p>
          You can ask to see the information we hold about you, correct it, have it deleted, or
          withdraw your consent. Email{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
          .
        </p>
        <p>
          If you're unhappy with how your information has been handled, you can complain to the
          Information Commissioner's Office at{" "}
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            ico.org.uk
          </a>
          .
        </p>
      </>
    ),
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy notice</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: November 2026</p>
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
