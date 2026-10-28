// Vapi client config. These are a *public* key and assistant IDs, which are
// designed to ship in client code (the key is locked to this site's origins
// and these two assistants in the Vapi dashboard), so they live in source
// rather than Vercel env vars. Env vars still win when set, for local testing.

/** Public key "UW Trainer - simple-options.co.uk". */
export const VAPI_PUBLIC_KEY =
  import.meta.env.VITE_VAPI_TRAINER_PUBLIC_KEY || "c8e010bf-482d-4811-a548-ddb66e6d5e57";

/** "UW Trainer - Customer Roleplay": plays the customer on /trainer. */
export const VAPI_TRAINER_ASSISTANT_ID =
  import.meta.env.VITE_VAPI_TRAINER_ASSISTANT_ID || "8b28d2a9-565f-41a6-bf7c-764126327e99";

/** "Sammy - UW Training - Sheila": the site-wide voice guide. */
export const VAPI_GUIDE_ASSISTANT_ID =
  import.meta.env.VITE_VAPI_ASSISTANT_ID || "0c6da073-7ab8-4ca7-9887-2cbeb5183838";
