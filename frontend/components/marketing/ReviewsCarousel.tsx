"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Landmark, LineChart, Scale } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SITUATIONS = [
  {
    title: "Changed jobs during the year?",
    copy:
      "Add Form 16 from each employer and check whether salary and tax deducted have been combined correctly.",
    cta: "See What to Upload",
    href: "/help/form16-upload",
    icon: BriefcaseBusiness,
  },
  {
    title: "Earned bank or fixed-deposit interest?",
    copy: "Review interest that may appear in AIS but not in Form 16.",
    cta: "Understand AIS",
    href: "/learn/ais-mismatch",
    icon: Landmark,
  },
  {
    title: "Sold shares or mutual funds?",
    copy:
      "Add supported statements and check whether more filing information may be required.",
    cta: "See Investment Guidance",
    href: "/learn/schedule-cg-explained",
    icon: LineChart,
  },
  {
    title: "Unsure about the old or new tax regime?",
    copy:
      "Compare both using your available income and eligible tax-saving details.",
    cta: "Compare Tax Options",
    href: "/tools/tax-calculator",
    icon: Scale,
  },
] as const;

export function ReviewsCarousel() {
  return (
    <section
      id="common-situations"
      className="section-pad-lg bg-[#f8fafc]/60 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 max-w-[720px]">
          <span className="eyebrow-label">Your situation</span>
          <h2 className="font-manrope mt-3 text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.02em] text-slate-900">
            Common situations LastminuteITR can help with
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SITUATIONS.map((situation) => {
            const Icon = situation.icon;
            return (
              <article
                key={situation.title}
                className="flex h-full flex-col rounded-[16px] border border-[#E6E8EC] bg-white p-6"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-[11px] bg-[#E8F3F1]">
                  <Icon className="size-5 text-[#0e5f63]" aria-hidden />
                </div>
                <h3 className="font-manrope text-[17px] font-bold leading-snug text-[#0B1220]">
                  {situation.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#6B7280]">
                  {situation.copy}
                </p>
                <Link
                  href={situation.href}
                  onClick={() =>
                    trackEvent("landing_cta_click", {
                      cta: "homepage_situation",
                      destination: situation.href,
                    })
                  }
                  className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#0e5f63] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2"
                >
                  {situation.cta}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
