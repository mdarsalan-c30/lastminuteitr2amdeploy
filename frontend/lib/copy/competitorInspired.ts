/**
 * Competitor-inspired marketing copy — rewritten for companion-first, compliance-safe positioning.
 * Reference only in comments; never ship competitor claims verbatim.
 */

export const WHY_US = {
  eyebrow: "Why LastminuteITR",
  headline: "Understand your return before you submit it",
  subhead:
    "LastminuteITR helps organise your tax information, identify items that may need review and explain the next filing steps in simple language.",
  pillars: [
    {
      id: "mismatch",
      title: "Check missing or different information",
      detail:
        "Review available salary, income and tax details before filing. Checks depend on the information and documents you add.",
      competitorRef: "ClearTax accuracy claim → our reconcile wedge",
    },
    {
      id: "regime",
      title: "Compare both tax regimes",
      detail:
        "See estimated tax under the old and new regimes using your available income and eligible tax-saving details.",
      competitorRef: "Quicko Save pillar → lawful regime choice",
    },
    {
      id: "portal",
      title: "Guidance for the official portal",
      detail:
        "See where your reviewed information needs to be entered on incometax.gov.in.",
      competitorRef: "Both e-file CTAs → companion differentiation",
    },
  ],
} as const;

export const PERSONA_CAROUSEL = {
  eyebrow: "Your situation",
  headline: "Guides for how Indians actually file",
  personas: [
    {
      id: "salaried",
      title: "Salaried",
      hook: "Form 16 scan → salary & TDS review",
      href: "/file/import/documents?source=form16",
      cta: "Upload Form 16",
    },
    {
      id: "job-change",
      title: "Two Form 16s",
      hook: "Combine employers after a mid-year switch",
      href: "/learn/two-form-16-job-change",
      cta: "Job change guide",
    },
    {
      id: "investor",
      title: "Investor",
      hook: "Capital gains need ITR-2 — we flag early",
      href: "/learn/schedule-cg-explained",
      cta: "Capital gains guide",
    },
    {
      id: "senior",
      title: "Senior citizen",
      hook: "Pension, FD interest, 80TTB / 80D",
      href: "/learn/senior-citizen-80ttb",
      cta: "Senior guide",
    },
    {
      id: "ais",
      title: "AIS mismatch",
      hook: "Fix TDS gaps before portal upload",
      href: "/learn/ais-mismatch",
      cta: "AIS guide",
    },
  ],
} as const;

export const EVERIFY_URGENCY = {
  headline: "E-verify within 30 days",
  body:
    "After you submit on incometax.gov.in, e-verification is mandatory within 30 days. An unverified return is treated as if never filed — refund processing will not start.",
  methods: "Aadhaar OTP is usually fastest; net banking and signed ITR-V are alternatives on the portal.",
} as const;
