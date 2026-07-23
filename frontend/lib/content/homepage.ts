export const PAIN_POINTS = {
  eyebrow: "Sound familiar?",
  headline: "Last-minute filing shouldn't feel like guesswork",
  items: [
    {
      title: "Form 16 vs AIS mismatch",
      detail: "TDS or salary figures don't match — refunds get delayed or notices follow.",
    },
    {
      title: "Old vs new regime confusion",
      detail: "One wrong choice can cost thousands. You need a clear comparison, not jargon.",
    },
    {
      title: "Portal field anxiety",
      detail: "incometax.gov.in has dozens of fields — one typo can block submission.",
    },
    {
      title: "Deduction proof stress",
      detail: "80C, 80D, HRA — only eligible claims with proof count. No shortcuts.",
    },
  ],
} as const;

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  headline: "From Form 16 to a filing-ready summary",
  steps: [
    {
      step: "1",
      title: "Add your tax documents",
      detail: "Start with Form 16 from your employer. Add AIS and other supporting documents when required.",
    },
    {
      step: "2",
      title: "Check your income and tax details",
      detail: "We organise available information and highlight amounts that may be missing or need your review.",
    },
    {
      step: "3",
      title: "Answer only what is missing",
      detail: "Answer simple questions about rent, insurance, investments, loans, other income or trading activity. You can review and edit every answer.",
    },
    {
      step: "4",
      title: "Complete filing on the Income Tax Portal",
      detail: "Follow screen-by-screen guidance, submit your return and complete e-verification on incometax.gov.in. LastminuteITR does not submit the return on your behalf.",
    },
  ],
} as const;

export const AI_CA_CHECKS = {
  eyebrow: "AI checks",
  headline: "What your AI assistant reviews before you file",
  checks: [
    "Form 16 salary vs AIS TDS reconciliation",
    "Old vs new regime tax comparison",
    "Eligible deduction suggestions with proof reminders",
    "ITR form recommendation (ITR-1, 2, 3, or 4)",
    "Pre-submit completeness and notice-risk flags",
  ],
} as const;

export const PORTAL_COMPANION = {
  eyebrow: "Portal companion",
  headline: "Your numbers, mapped to incometax.gov.in",
  body:
    "After prep, unlock a step-by-step guide with copy-ready values for each portal field. You stay in control — we never auto-submit to the Income Tax Department.",
  bullets: [
    "Field-by-field mapping to the government portal",
    "Copy-paste ready figures from your verified draft",
    "Works for ITR-1 salaried returns and beyond",
    "You submit and e-verify on incometax.gov.in yourself",
  ],
} as const;

export const INDIAN_USE_CASES = {
  eyebrow: "Built for Indian filers",
  headline: "Real situations we help with",
  personas: [
    {
      title: "Senior salaried",
      detail: "Pension + FD interest + 80D — regime choice matters more than you think.",
    },
    {
      title: "Two Form 16s",
      detail: "Job switch mid-year? We combine employers and reconcile total TDS.",
    },
    {
      title: "AIS surprises",
      detail: "Extra interest or TDS entries in AIS — catch them before filing.",
    },
    {
      title: "Refund anxiety",
      detail: "Review a preliminary refund or tax-due estimate before completing your return.",
    },
    {
      title: "Parents' return",
      detail: "Help mom or dad file — simple walkthrough, proof-based deductions only.",
    },
  ],
} as const;

export const PROOF_DEDUCTIONS = {
  eyebrow: "Proof-based claims",
  headline: "Lawful tax saving — nothing made up",
  body:
    "We suggest eligible deductions based on what you tell us. Every claim should match real payments and documents you can show if asked.",
  points: [
    "80C only for investments you actually made",
    "HRA with valid rent proof where applicable",
    "80D for health premiums you paid",
    "No fake donations, inflated rent, or hidden loopholes",
  ],
} as const;

export const EXPANDED_FAQ = {
  eyebrow: "Questions",
  headline: "Questions before you begin",
} as const;
