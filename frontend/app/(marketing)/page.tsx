import type { Metadata } from "next";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { pageMetadata } from "@/lib/seo";

const baseMetadata = pageMetadata({
  title: "File ITR Online with Smart-Tax Companion | LastminuteITR",
  description:
    "Upload Form 16, review AIS and tax details, compare Old and New Tax regimes, and prepare your ITR with simple step-by-step guidance. You review and submit the return on the Income Tax Portal.",
  path: "/",
});

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: { canonical: "https://lastminuteitr.in/" },
  openGraph: {
    ...baseMetadata.openGraph,
    title: "Prepare Your ITR in Simple Steps | LastminuteITR",
    description:
      "Organise your tax documents, review income and deductions, compare tax options and get guided support for filing on incometax.gov.in.",
    url: "https://lastminuteitr.in/",
  },
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomePageContent />
      <SiteFooter />
    </>
  );
}
