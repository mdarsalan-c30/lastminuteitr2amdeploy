"use client";

import Link from "next/link";
import { FileText, UploadCloud } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { HOMEPAGE_DOCUMENT_SUPPORT } from "@/lib/connectors/homepageSupport";

export function QuickStart() {
  return (
    <section
      id="document-support"
      className="section-pad-lg bg-[#FAFAFB] px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 max-w-[720px]">
          <span className="eyebrow-label">Document support</span>
          <h2 className="font-manrope mt-3.5 text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.02em] text-[#0B1220]">
            Start with the documents you already have
          </h2>
          <p className="mt-4 max-w-[680px] text-[15.5px] leading-relaxed text-[#6B7280]">
            Upload supported tax documents and statements. We organise available information and
            tell you what still needs to be entered or reviewed.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {HOMEPAGE_DOCUMENT_SUPPORT.map((document) => (
            <article
              key={document.id}
              className="flex h-full flex-col rounded-[16px] border border-[#E6E8EC] bg-white p-6"
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-[11px] bg-[#E8F3F1]">
                {document.id === "form16" ? (
                  <UploadCloud className="size-5 text-[#0e5f63]" aria-hidden />
                ) : (
                  <FileText className="size-5 text-[#0e5f63]" aria-hidden />
                )}
              </div>
              <h3 className="font-manrope text-[17px] font-bold text-[#0B1220]">
                {document.name}
              </h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#6B7280]">
                {document.purpose}
              </p>
              <span className="mt-4 w-fit rounded-full border border-[#B8D8D3] bg-[#E8F3F1] px-2.5 py-1 text-[11px] font-bold text-[#0e5f63]">
                {document.status}
              </span>
              <Link
                href={document.href}
                onClick={() => {
                  if (document.id === "form16") {
                    trackEvent("homepage_form16_clicked", {
                      location: "document_support",
                    });
                  } else {
                    trackEvent("landing_cta_click", {
                      cta: "document_support",
                      support_id: document.id,
                    });
                  }
                }}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8DDDF] px-4 py-2.5 text-sm font-semibold text-[#0e5f63] transition hover:border-[#0e5f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2"
              >
                {document.cta}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-5 text-sm text-[#6B7280]">
          More document integrations are coming soon.
        </p>

        <div className="mt-8 rounded-[14px] border border-[#DDE4E3] bg-white px-5 py-4">
          <p className="text-[13.5px] leading-relaxed text-[#2B3344]">
            <strong className="text-[#0B1220]">Early access.</strong> LastminuteITR is currently
            available in early access. Some document checks and integrations may be in beta.
            Review every important figure before using it in your return.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#6B7280]">
            Any refund or tax payable shown is an estimate. The Income Tax Department determines
            the final result after processing the return.
          </p>
        </div>
      </div>
    </section>
  );
}
