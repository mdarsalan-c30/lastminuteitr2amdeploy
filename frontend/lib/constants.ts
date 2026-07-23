export const SITE_NAME = "LastminuteITR";
export const SITE_TAGLINE =
  "Guided ITR preparation — you review and submit on incometax.gov.in yourself";
export const SITE_DESCRIPTION =
  "Upload tax documents, review income and deductions, compare tax regimes, and prepare your return with screen-by-screen portal guidance.";

export const ASSESSMENT_YEAR = "AY 2026-27";
export const FINANCIAL_YEAR = "FY 2025-26";

/** Original due date for non-audit individual filers (IST). */
export const ITR_FILING_DEADLINE = "2026-07-31T23:59:59+05:30";
export const ITR_FILING_DEADLINE_LABEL = "31 July 2026";

export type { Plan as PricingPlan, PlanId as PricingPlanId } from "@/lib/payments/plans";
export { PLAN_LIST as PRICING_PLANS } from "@/lib/payments/plans";

export const DEMO_REGIME_TAX: { old: number; new: number } = {
  old: 82_429,
  new: 65_913,
};

export const TRUST_ITEMS = [
  "Only legal savings",
  "Your data stays private",
  "Companion filing on gov portal",
] as const;

/** Seeded illustrative testimonials — not live analytics; do not show as verified metrics */
export const BETA_TESTIMONIAL_COUNT = 6;

export {
  QUICK_START_CONNECTORS,
  type ConnectorStatus,
} from "@/lib/connectors/registry";
