"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { trackEvent } from "@/lib/analytics";

const SUPPORT_EMAIL = "contact@lastminuteitr.in";

const LEARN_LINKS = [
  { label: "Tax Guides", href: "/learn" },
  { label: "Tax Glossary", href: "/glossary" },
  { label: "Free Tax Tools", href: "/tools" },
  { label: "Blog", href: "/blogs" },
] as const;

const PRODUCT_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Start My ITR", href: "/file/onboarding/eligibility?step=about-you" },
  { label: "Log In", href: "/auth/login" },
  { label: "Help & Support", href: "/help" },
] as const;

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: `mailto:${SUPPORT_EMAIL}` },
  { label: "For Tax Professionals", href: "/#b2b" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Refund & Correction Policy", href: "/refund-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[#6B7280]">
        {title}
      </h2>
      <ul className="space-y-2.5 text-[14px] text-[#2B3344]">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              onClick={() => {
                if (link.href === "/help") {
                  trackEvent("homepage_help_clicked", {
                    location: "footer",
                  });
                } else if (link.label === "Start My ITR") {
                  trackEvent("homepage_start_itr_clicked", {
                    location: "footer",
                  });
                }
              }}
              className="rounded-sm transition-colors hover:text-[#0e5f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E6E8EC] bg-white px-5 pb-8 pt-16 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <BrandLogo href="/" variant="wordmark" size="sm" />
            <p className="mt-4 max-w-[300px] text-[13.5px] leading-[1.65] text-[#6B7280]">
              LastminuteITR helps Indian taxpayers organise tax information, compare tax options
              and prepare for filing on incometax.gov.in. You review, submit and e-verify the
              return yourself.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex min-h-11 items-center text-[13.5px] font-semibold text-[#0e5f63] hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <FooterColumn title="Learn" links={LEARN_LINKS} />
          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-10 rounded-[10px] bg-[#F3F4F7] px-5 py-4 text-[12.5px] leading-relaxed text-[#6B7280]">
          LastminuteITR is independently operated and is not affiliated with or authorised by the
          Income Tax Department.
          <span className="mt-1 block">
            <strong className="text-[#2B3344]">GSTIN:</strong> 27BOHPA6051D1ZD
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E6E8EC] pt-6 text-[12.5px] text-[#9CA3AF]">
          <span>© {new Date().getFullYear()} LastminuteITR</span>
          <span>Guided ITR preparation for AY 2026–27</span>
        </div>
      </div>
    </footer>
  );
}
