import { describe, expect, it } from "vitest";
import { LAUNCH_OFFER, getEntryPriceInr, getLaunchOfferEndDate } from "../offer";

describe("LAUNCH_OFFER config", () => {
  it("keeps the legacy launch-offer configuration disabled", () => {
    expect(LAUNCH_OFFER.planId).toBe("pro");
    expect(LAUNCH_OFFER.enabled).toBe(false);
    expect(LAUNCH_OFFER.launchPriceInr).toBe(599);
    expect(LAUNCH_OFFER.originalPriceInr).toBe(599);
  });

  it("entry price matches Starter", () => {
    expect(getEntryPriceInr()).toBe(349);
  });

  it("parses launchOfferEndsAt as a valid date", () => {
    const end = getLaunchOfferEndDate();
    expect(Number.isNaN(end.getTime())).toBe(false);
  });
});
