export const outreachConfig = {
  mailbox: "SavoyVentures@outlook.com",
  founder: "Dominic Savoy",
  phone: "+15715550198",
  website: "https://savoyventures.org",
  checkout: "https://buy.stripe.com/3cI3cvfSX0A47839B6fYY00",
  signaturePreview: "https://savoyventures.org/email/signature.html",
  workflow: [
    "Find retailers with visible product-catalog quality problems.",
    "Verify the business, decision-maker role, and public business contact details.",
    "Score fit for the fixed-scope $250 Catalog Rescue pilot.",
    "Send a personalized message from the connected company mailbox.",
    "Track delivery, replies, follow-ups, checkout clicks, and Stripe payments.",
    "Stop outreach on opt-out, invalid address, complaint, or poor fit.",
    "Open a paid delivery job only after Stripe confirms payment.",
  ],
} as const;
