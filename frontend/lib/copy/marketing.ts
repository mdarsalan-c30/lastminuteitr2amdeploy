import { getEntryPriceInr } from "@/lib/marketing/offer";
import { formatPlanPriceLabel } from "@/lib/marketing/pricing";

export const HERO_HEADLINE =
  "File your own ITR with guided support.";

export const HERO_HEADLINE_ACCENT =
  "Upload Form 16, AIS, capital gains, F&O — step-by-step guide on incometax.gov.in.";

export const HERO_EMOTIONAL_HOOK =
  "Upload Form 16 and AIS, review tax details, and get a step-by-step guide to file directly on incometax.gov.in.";

export const HERO_TRUST_LINE =
  "Estimate only — ITD confirms your final refund · You file on incometax.gov.in · Not a government service";

export const HERO_CTAS = {
  uploadForm16: {
    label: "Upload Form 16",
    href: "/file/import/documents?source=form16",
  },
  startFiling: {
    label: `Start filing from ${formatPlanPriceLabel(getEntryPriceInr())}`,
    href: "/file/checkout/plans?plan=normal",
  },
  howItWorks: {
    label: "See how it works",
    href: "#how-it-works",
  },
} as const;

export const PRICING_SECTION = {
  eyebrow: "Pricing",
  headline: "Choose the level of guidance you need",
  subhead:
    "Start with a free estimate. Choose a plan when you are ready to prepare your filing summary and use the screen-by-screen Income Tax Portal guide.",
  helperLine:
    "One-time payment · No automatic subscription · Secure Razorpay checkout · Tax invoice available",
} as const;

export const PAYMENT_COPY = {
  secureLine: "UPI / card via Razorpay · Secure payment · No card storage on our servers",
  portalLine:
    "Payment unlocks your step-by-step portal guide — you copy values into incometax.gov.in yourself.",
  filesLine: "After filing, your return and acknowledgements live on the government portal.",
} as const;

export const FINAL_CTA = {
  headline: "Ready to prepare your return?",
  subhead:
    "Start with Form 16 or enter a few basic details. Review your income, tax-saving information and estimated tax before choosing a paid plan.",
  primary: "Start My ITR",
  secondary: "Start with Form 16",
} as const;
