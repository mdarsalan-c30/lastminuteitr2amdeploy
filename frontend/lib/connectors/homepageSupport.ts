import { CONNECTOR_REGISTRY } from "@/lib/connectors/registry";

export type HomepageDocumentStatus =
  | "Available"
  | "Beta"
  | "Manual entry available";

export interface HomepageDocumentSupport {
  id: string;
  name: string;
  purpose: string;
  status: HomepageDocumentStatus;
  cta: string;
  href: string;
}

const form16IsLive = CONNECTOR_REGISTRY.some(
  (connector) => connector.id === "form16" && connector.status === "live"
);

const hasGuidedInvestmentUpload = CONNECTOR_REGISTRY.some(
  (connector) =>
    ["groww", "zerodha", "upstox", "dhan", "angelone", "cams", "crypto"].includes(
      connector.id
    ) && connector.status === "guided"
);

/**
 * Homepage summary derived from the same registry used by the upload screen.
 * Future/roadmap connectors are deliberately excluded from public promotion.
 */
export const HOMEPAGE_DOCUMENT_SUPPORT: HomepageDocumentSupport[] = [
  ...(form16IsLive
    ? [
        {
          id: "form16",
          name: "Form 16",
          purpose: "Salary and employer TDS",
          status: "Available" as const,
          cta: "Upload Form 16",
          href: "/file/import/documents?source=form16",
        },
      ]
    : []),
  ...(hasGuidedInvestmentUpload
    ? [
        {
          id: "investment-statements",
          name: "Investment and trading statements",
          purpose: "Supported capital-gain and trading information",
          status: "Beta" as const,
          cta: "Add a statement",
          href: "/file/import/documents",
        },
      ]
    : []),
  {
    id: "manual-entry",
    name: "Other tax details",
    purpose: "Income, deductions, tax credits and supporting information",
    status: "Manual entry available",
    cta: "Enter details",
    href: "/file/import/documents",
  },
];
