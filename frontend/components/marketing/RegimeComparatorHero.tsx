"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const REGIMES = [
  {
    title: "Old Tax Regime",
    detail: "Allows eligible deductions and exemptions when supported by your information.",
  },
  {
    title: "New Tax Regime",
    detail: "Uses different slab rates with fewer commonly claimed deductions.",
  },
] as const;

export function RegimeComparatorHero() {
  return (
    <div
      className="w-full min-w-0 rounded-[20px] bg-white p-4 sm:rounded-[24px] sm:p-7"
      style={{
        border: "1px solid #E6E8EC",
        boxShadow:
          "0 24px 60px -24px rgba(11,18,32,.16), 0 2px 4px rgba(11,18,32,.04)",
      }}
    >
      <span className="eyebrow-label" style={{ fontSize: 11.5 }}>
        Tax regime comparison
      </span>
      <h2 className="font-manrope mt-2 text-[22px] font-bold tracking-[-0.01em] text-[#0B1220]">
        Which tax option may suit you?
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[#6B7280]">
        Compare estimated tax under both regimes using your income and eligible tax-saving
        details.
      </p>

      <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {REGIMES.map((regime) => (
          <div
            key={regime.title}
            className="rounded-[16px] border border-[#E6E8EC] bg-[#FAFAFB] p-4"
          >
            <div className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#0e5f63]">
              {regime.title}
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#6B7280]">
              {regime.detail}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-[10px] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#2B3344]"
        style={{ background: "#F2F9E5" }}
      >
        Your result may differ based on income, deductions and separately taxed income.
      </div>

      <Link
        href="/tools/tax-calculator"
        onClick={() =>
          trackEvent("homepage_tool_clicked", {
            tool: "tax_calculator",
            location: "hero",
          })
        }
        className="btn-pill-primary mt-5 w-full justify-center"
      >
        Compare Using My Income
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
