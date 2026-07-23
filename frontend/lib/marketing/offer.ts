import type { PlanId } from "@/lib/filing/types";
import { PLANS } from "@/lib/payments/plans";

export const LAUNCH_OFFER = {
  planId: "pro" as PlanId,
  enabled: false,
  originalPriceInr: PLANS.pro.price,
  launchPriceInr: PLANS.pro.price,
  /** Configurable ISO end time (IST). */
  launchOfferEndsAt: "2026-07-31T23:59:59+05:30",
  afterExpiryBehavior: "show_original" as const,
} as const;

export const OFFER_PILL_LABEL = "Launch pricing";

export const OFFER_HELPER_COPY =
  "One-time payment for Guided filing support. You still file on incometax.gov.in yourself.";

export const OFFER_EXPIRED_COPY =
  "Guided filing support is available at regular pricing.";

export function getLaunchOfferEndDate(): Date {
  return new Date(LAUNCH_OFFER.launchOfferEndsAt);
}

/** Lowest paid consumer plan price — use for “from ₹X” CTAs. */
export function getEntryPriceInr(): number {
  return Math.min(PLANS.normal.price, PLANS.pro.price);
}
