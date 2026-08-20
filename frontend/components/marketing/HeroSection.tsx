"use client";

import Link from "next/link";
import { RegimeComparatorHero } from "@/components/marketing/RegimeComparatorHero";
import { CaRegistrationForm } from "@/components/marketing/CaRegistrationForm";
import { trackEvent } from "@/lib/analytics";
import {
  B2B_HERO_FEATURES,
  B2B_HERO_HEADLINE,
  B2B_HERO_HEADLINE_ACCENT,
  B2B_HERO_SUBTEXT,
} from "@/lib/copy/b2b";
import {
  type HeroRibbonConfig,
  shouldShowHeroRibbon,
} from "@/lib/marketing/heroRibbon";
import { cn } from "@/lib/utils";

export function HeroSection({
  mode,
  setMode,
  ribbon,
}: {
  mode: "b2c" | "b2b";
  setMode: (m: "b2c" | "b2b") => void;
  ribbon: HeroRibbonConfig | null;
}) {
  return (
    <header
      className="relative overflow-hidden"
      style={{ padding: "32px 0 16px", background: "#FAFAFB" }}
    >
      {shouldShowHeroRibbon(mode, ribbon) && (
        <div
          data-testid="hero-offer-ribbon"
          className={cn(
            "absolute right-2 top-2 z-20 rotate-3 drop-shadow-[0_12px_18px_rgba(14,95,99,0.18)]",
            ribbon.showOnMobile
              ? "block w-36 min-[700px]:w-48 min-[1100px]:w-64"
              : "hidden w-64 min-[1100px]:block",
            !ribbon.linkUrl && "pointer-events-none"
          )}
        >
          {ribbon.linkUrl ? (
            <a href={ribbon.linkUrl} aria-label={ribbon.altText}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ribbon.imageUrl}
                alt={ribbon.altText}
                className="h-auto w-full transition-transform hover:scale-[1.03]"
              />
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ribbon.imageUrl} alt={ribbon.altText} className="h-auto w-full" />
          )}
        </div>
      )}

      {/* Background orbs */}
      <div
        className="hero-orb"
        style={{
          width: 520,
          height: 520,
          background: "radial-gradient(circle, #bfe9e0, transparent 70%)",
          top: -180,
          right: -160,
          opacity: 0.35,
        }}
        aria-hidden
      />
      <div
        className="hero-orb"
        style={{
          width: 420,
          height: 420,
          background: "radial-gradient(circle, #0e5f63, transparent 70%)",
          bottom: -200,
          left: -180,
          opacity: 0.18,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1180px] px-8 max-[560px]:px-5">

        {/* Toggle Switch */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-full bg-white p-1.5 shadow-[0_2px_12px_rgba(11,18,32,0.06)] border border-[#E6E8EC] grid grid-cols-2 w-[400px] max-w-full">
            <button
              onClick={() => setMode("b2c")}
              className={cn(
                "relative z-10 flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[14.5px] font-semibold transition-all duration-300",
                mode === "b2c"
                  ? "bg-[#0e5f63] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#0B1220]"
              )}
            >
              Individual Filer
            </button>
            <button
              onClick={() => setMode("b2b")}
              className={cn(
                "relative z-10 flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[14.5px] font-semibold transition-all duration-300",
                mode === "b2b"
                  ? "bg-[#0e5f63] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#0B1220]"
              )}
            >
              B2B Model For CAs
            </button>
          </div>
        </div>

        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] max-[980px]:grid-cols-1 max-[980px]:gap-10 max-[560px]:gap-8">
          {/* Left copy */}
          <div>
            {mode === "b2c" ? (
              <>
                {/* B2C Content */}

                <h1
                  className="font-manrope font-black tracking-tight text-slate-900"
                  style={{
                    fontSize: "clamp(28px, 4.2vw, 48px)",
                    lineHeight: 1.1,
                    marginBottom: 16,
                  }}
                >
                  File your ITR online <br className="hidden sm:block" />
                  <span style={{ color: "#0e5f63" }}>
                    — Your personal income-tax filing companion
                  </span>
                </h1>

                <p
                  className="text-slate-700 font-medium leading-relaxed"
                  style={{
                    fontSize: "clamp(14px, 1.6vw, 15.5px)",
                    maxWidth: 580,
                    marginBottom: 14,
                  }}
                >
                  Start with Form 16 or enter a few basic details. LastminuteITR helps organise
                  your income, tax deducted, investments and other tax information, compares both
                  tax regimes and guides you through filing on the official{" "}
                  <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#0e5f63] hover:underline font-semibold">Income Tax Portal</a>.
                </p>

                <p className="mb-6 max-w-[580px] text-[13.5px] leading-relaxed text-[#6B7280]">
                  You review the information and submit and e-verify the return yourself on
                  incometax.gov.in.
                </p>

                <div id="b2c-name" className="mb-3 flex max-w-[520px] flex-col gap-3 sm:flex-row">
                  <Link
                    href="/file/onboarding/eligibility?step=about-you"
                    onClick={() =>
                      trackEvent("homepage_start_itr_clicked", {
                        location: "hero",
                      })
                    }
                    className="btn-pill-primary justify-center"
                  >
                    Start My ITR
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link
                    href="/file/import/documents?source=form16"
                    onClick={() =>
                      trackEvent("homepage_form16_clicked", {
                        location: "hero",
                      })
                    }
                    className="btn-pill-secondary justify-center"
                  >
                    Start with Form 16
                  </Link>
                </div>
                <p className="mb-7 text-[12.5px] font-medium text-[#6B7280]">
                  No payment required to start.
                </p>

                <div className="mb-3.5 flex flex-wrap gap-2.5">
                  {[
                    "You review every number",
                    "No automatic submission",
                    "Old and new regime comparison",
                    "Your progress is saved",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 rounded-[8px] border border-[#E6E8EC] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#2B3344]"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <circle cx="8" cy="8" r="6.5" stroke="#0e5f63" strokeWidth="1.3"/>
                        <path d="M5 8l2 2 4-4" stroke="#0e5f63" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {label}
                    </div>
                  ))}
                </div>
                <p className="max-w-[580px] text-[12px] leading-relaxed text-[#6B7280]">
                  Your documents are used to prepare your tax summary and filing guidance.{" "}
                  <Link href="/privacy" className="font-semibold text-[#0e5f63] hover:underline">
                    How we use your data
                  </Link>
                </p>

              </>
            ) : (
              <>
                {/* B2B Content */}

                <h1
                  className="font-manrope font-bold tracking-[-0.02em] text-[#0B1220]"
                  style={{
                    fontSize: "clamp(24px, 4.8vw, 48px)",
                    lineHeight: 1.15,
                    marginBottom: 16,
                  }}
                >
                  {B2B_HERO_HEADLINE}{" "}
                  <span style={{ color: "#0e5f63" }}>{B2B_HERO_HEADLINE_ACCENT}</span>
                </h1>

                <p
                  style={{
                    fontSize: "clamp(14px, 1.8vw, 16.5px)",
                    color: "#2B3344",
                    maxWidth: 520,
                    marginBottom: 28,
                    lineHeight: 1.55,
                  }}
                >
                  {B2B_HERO_SUBTEXT}
                </p>

                <div className="mb-3.5 flex flex-col gap-2.5">
                  {B2B_HERO_FEATURES.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-[14.5px] font-medium text-[#2B3344]"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                        <circle cx="10" cy="10" r="10" fill="#F2F9E5" />
                        <path d="M6 10l3 3 5-6" stroke="#74A81F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 12.5, color: "#6B7280", maxWidth: 480, lineHeight: 1.5 }}>
                  You stay in control — clients file on the government portal. We never auto-submit
                  on their behalf.
                </p>
              </>
            )}
          </div>

          {/* Right: Component depending on mode */}
          <div className="xl:-mt-10 lg:-mt-6">
            {mode === "b2c" ? <RegimeComparatorHero /> : <CaRegistrationForm />}
          </div>
        </div>
      </div>
    </header>
  );
}
