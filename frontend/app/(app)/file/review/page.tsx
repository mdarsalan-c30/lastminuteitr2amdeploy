"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Button, Card } from "@/components/filing/ui";
import { useDraftTaxCompute } from "@/lib/hooks/useDraftTaxCompute";
import { trackEvent } from "@/lib/analytics";
import {
  buildDeductionChecklist,
  summarizeDeductionChecklist,
} from "@/lib/filing/deductionChecklist";
import {
  buildReconciliationStatements,
  summarizeReconciliationRows,
  type ReconciliationRow,
} from "@/lib/filing/reconciliation";
import { evaluateScopeGate } from "@/lib/filing/scopeGate";
import { formatINR } from "@/lib/filing/types";
import { PLANS, normalizePlanId } from "@/lib/payments/plans";
import { useDraftStore } from "@/lib/store/draft";
import type { ITRResult, TaxRegime } from "@/lib/engine/types";

type ResultState = "refund" | "payable" | "balanced" | "incomplete" | "failed";

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "good" | "warning" | "neutral";
}) {
  const styles = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function Progress() {
  return (
    <div aria-label="Step 6 of 8: Final Tax Check" className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span className="text-primary">Step 6 of 8</span>
        <span className="text-slate-500">75% complete</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-3/4 rounded-full bg-primary" />
      </div>
    </div>
  );
}

function ResultCard({
  result,
  selectedRegime,
}: {
  result: ITRResult;
  selectedRegime: TaxRegime;
}) {
  const slab = result.regime_comparison[selectedRegime];
  const amount = Math.abs(slab.net_payable);
  const state: ResultState =
    slab.net_payable < 0 ? "refund" : slab.net_payable > 0 ? "payable" : "balanced";
  const title =
    state === "refund"
      ? "Estimated refund"
      : state === "payable"
        ? "Estimated tax to pay"
        : "No additional refund or tax to pay";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white via-white to-blue-50/70 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Preliminary tax result
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">{title}</h2>
        </div>
        <StatusPill tone="neutral">
          {selectedRegime === "new" ? "New regime" : "Old regime"} estimate
        </StatusPill>
      </div>
      {state !== "balanced" && (
        <p className={`mt-3 text-4xl font-extrabold tabular-nums sm:text-5xl ${state === "refund" ? "text-emerald-700" : "text-slate-950"}`}>
          {formatINR(amount)}
        </p>
      )}
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Based on the information currently added. This is an estimate, not a promise; the
        Income Tax Department determines the final amount after filing and e-verification.
      </p>
    </Card>
  );
}

function SummaryCard({
  eyebrow,
  title,
  detail,
  href,
  event,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  event: "review_regime_opened" | "review_itr_form_opened" | "review_document_status_opened";
}) {
  return (
    <Card className="h-full">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{detail}</p>
      <Link
        href={href}
        onClick={() => trackEvent(event)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Review <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Card>
  );
}

function ActionSection({
  attention,
  missing,
  itrNeedsReview,
}: {
  attention: number;
  missing: number;
  itrNeedsReview: boolean;
}) {
  const required = attention + (itrNeedsReview ? 1 : 0);
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Required actions</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {required ? `${required} ${required === 1 ? "item" : "items"} need review` : "No required actions"}
          </h2>
        </div>
        <StatusPill tone={required ? "warning" : "good"}>
          {required ? "Review required" : "Ready to continue"}
        </StatusPill>
      </div>
      <div className="mt-4 space-y-3">
        {attention > 0 && (
          <Link
            href="/file/import/mismatch"
            onClick={() => trackEvent("review_required_action_opened")}
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden />
            <span><strong className="block text-sm text-slate-900">Review {attention} actual source {attention === 1 ? "difference" : "differences"}</strong><span className="text-xs text-slate-600">These lines have available values that need confirmation.</span></span>
          </Link>
        )}
        {itrNeedsReview && (
          <Link href="/file/start" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden />
            <span><strong className="block text-sm text-slate-900">Review the likely ITR form</strong><span className="text-xs text-slate-600">Your case includes information that needs a guided form check.</span></span>
          </Link>
        )}
        {!required && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <CheckCircle2 className="size-5 text-emerald-700" aria-hidden />
            <p className="text-sm font-semibold text-emerald-900">Your current information has no blocking review items.</p>
          </div>
        )}
        {missing > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{missing} optional {missing === 1 ? "source is" : "sources are"} not added</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">AIS or Form 26AS can strengthen cross-checks. Missing documents are not treated as number mismatches.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function DocumentDetails({ rows, paid }: { rows: ReconciliationRow[]; paid: boolean }) {
  const summary = summarizeReconciliationRows(rows);
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Document and tax-credit check</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Source status</h2>
        </div>
        <FileCheck2 className="size-6 text-primary" aria-hidden />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-emerald-50 p-3"><strong className="block text-xl text-emerald-800">{summary.matched}</strong><span className="text-xs text-emerald-800">Matched</span></div>
        <div className="rounded-xl bg-amber-50 p-3"><strong className="block text-xl text-amber-900">{summary.attention}</strong><span className="text-xs text-amber-900">Needs review</span></div>
        <div className="rounded-xl bg-slate-100 p-3"><strong className="block text-xl text-slate-800">{summary.missing}</strong><span className="text-xs text-slate-700">Missing</span></div>
      </div>
      {paid && (
        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold text-slate-900">{row.label}</p><p className="text-xs leading-5 text-slate-600">{row.detail}</p></div>
              <StatusPill tone={row.severity === "matched" ? "good" : row.severity === "attention" ? "warning" : "neutral"}>
                {row.severity === "matched" ? "Matched" : row.severity === "attention" ? "Needs review" : "Missing source"}
              </StatusPill>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PaidDetails({
  result,
  selectedRegime,
  deductionSummary,
}: {
  result: ITRResult;
  selectedRegime: TaxRegime;
  deductionSummary: ReturnType<typeof summarizeDeductionChecklist>;
}) {
  const slab = result.regime_comparison[selectedRegime];
  const lines = [
    ["Taxable income", slab.taxable_income],
    ["Tax before rebate", slab.gross_tax],
    ["Rebate", -slab.rebate_87a],
    ["Cess", slab.cess],
    ["Total tax", slab.total_tax],
    ["TDS and advance tax", -slab.tds_and_advance_tax],
  ] as const;
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Full tax breakdown</p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">Your filing summary</h2>
      <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
        {lines.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <dt className="text-slate-600">{label}</dt>
            <dd className="font-semibold tabular-nums text-slate-950">{value < 0 ? "−" : ""}{formatINR(Math.abs(value))}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-slate-700">
        <strong className="text-slate-950">Tax-saving review:</strong> {deductionSummary.claimed} claimed, {deductionSummary.needsProof} need supporting information, and {deductionSummary.notApplicable} are not applicable under the current facts.
      </div>
    </Card>
  );
}

function ReviewDashboard() {
  const draft = useDraftStore(
    useShallow((s) => ({
      regime: s.regime,
      recommendedForm: s.recommendedForm,
      incomeChips: s.incomeChips,
      connectedConnectors: s.connectedConnectors,
      income: s.income,
      deductions: s.deductions,
      houseProperty: s.houseProperty,
      mismatchResolved: s.mismatchResolved,
      paidPlanId: s.paidPlanId,
      plan: s.plan,
      paymentVerifiedAt: s.paymentVerifiedAt,
    }))
  );
  const { loading, error, engineUnavailable, result, lastSnapshot, userInput, compute } = useDraftTaxCompute();
  const effectiveResult = result ?? lastSnapshot;
  const selectedRegime: TaxRegime =
    draft.regime ?? effectiveResult?.regime_comparison.recommended_regime ?? "new";
  const rows = useMemo(
    () =>
      buildReconciliationStatements({
        connectedConnectors: draft.connectedConnectors,
        grossSalary: draft.income.grossSalary,
        tds: draft.income.tds,
        fdInterest: draft.income.fdInterest,
        mismatchResolved: draft.mismatchResolved,
      }),
    [draft.connectedConnectors, draft.income, draft.mismatchResolved]
  );
  const rowSummary = useMemo(() => summarizeReconciliationRows(rows), [rows]);
  const deductionSummary = useMemo(
    () =>
      summarizeDeductionChecklist(
        buildDeductionChecklist({
          deductions: draft.deductions,
          houseProperty: draft.houseProperty,
          income: draft.income,
          regime: selectedRegime,
        })
      ),
    [draft.deductions, draft.houseProperty, draft.income, selectedRegime]
  );
  const likelyForm = effectiveResult?.profile.itr_form ?? draft.recommendedForm;
  const scope = evaluateScopeGate({
    incomeChips: draft.incomeChips,
    recommendedForm: likelyForm,
  });
  const complexChips = new Set(["capital_gains", "crypto", "fno", "freelance", "business_presumptive", "nri", "foreign"]);
  const recommendedPlanId = draft.incomeChips.some((chip) => complexChips.has(chip)) ? "pro" : "normal";
  const recommendedPlan = PLANS[recommendedPlanId];
  const normalizedPaidPlan = normalizePlanId(draft.paidPlanId ?? draft.plan);
  // Preserve the existing entitlement signal. Older verified drafts may not
  // have paidPlanId populated, so paymentVerifiedAt remains authoritative.
  const isPaid = Boolean(draft.paymentVerifiedAt);
  const activePlan = normalizedPaidPlan ? PLANS[normalizedPaidPlan] : null;
  const itrNeedsReview = scope.verdict === "blocked" || Boolean(effectiveResult?.profile.expert_required);
  const requiredCount = rowSummary.attention + (itrNeedsReview ? 1 : 0);

  useEffect(() => {
    trackEvent("review_page_view", {
      paid_state: isPaid ? "paid" : "unpaid",
      blocker_count: requiredCount,
      warning_count: rowSummary.missing,
      recommended_plan: recommendedPlanId,
      likely_itr_category: likelyForm,
    });
    if (effectiveResult) {
      trackEvent("review_tax_result_viewed", {
        result_state:
          effectiveResult.regime_comparison[selectedRegime].net_payable < 0
            ? "refund"
            : effectiveResult.regime_comparison[selectedRegime].net_payable > 0
              ? "payable"
              : "balanced",
        paid_state: isPaid ? "paid" : "unpaid",
      });
    }
    if (!isPaid) {
      trackEvent("review_plan_recommendation_viewed", {
        recommended_plan: recommendedPlanId,
      });
    }
  }, [
    effectiveResult,
    isPaid,
    likelyForm,
    recommendedPlanId,
    requiredCount,
    rowSummary.missing,
    selectedRegime,
  ]);

  if (loading && !effectiveResult) {
    return (
      <FilingLayout variant="wide">
        <Progress />
        <h1 className="text-3xl font-bold text-slate-950">Your final tax check</h1>
        <p className="mt-2 text-slate-600">Preparing your final tax check…</p>
        <div className="mt-6 h-56 animate-pulse rounded-2xl bg-slate-100" aria-label="Preparing your final tax check" />
      </FilingLayout>
    );
  }

  if ((error || engineUnavailable) && !effectiveResult) {
    return (
      <FilingLayout variant="wide">
        <Progress />
        <Card className="border-red-200" >
          <div role="alert">
            <h1 className="text-2xl font-bold text-slate-950">We could not load your final tax check</h1>
            <p className="mt-2 text-sm text-slate-600">Your saved information has not been changed.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => void compute(userInput)}>Try Again</Button>
            <Button href="/file/income" variant="secondary">Return to Income & Tax Savings</Button>
            <Button href="/help" variant="ghost">Get Help</Button>
          </div>
        </Card>
      </FilingLayout>
    );
  }

  return (
    <FilingLayout variant="wide">
      <Progress />
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Your final tax check</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Review what is complete, what needs attention, and what your selected filing plan includes.</p>
          </div>
          {isPaid && activePlan && <StatusPill tone="good">{activePlan.name} plan active</StatusPill>}
        </div>
      </header>

      {!effectiveResult ? (
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Your calculation is incomplete</h2>
          <p className="mt-2 text-sm text-slate-600">Add the required income information to prepare a preliminary tax result.</p>
          <Button href="/file/income" className="mt-5">Review Income & Tax Savings</Button>
        </Card>
      ) : (
        <>
          <ResultCard result={effectiveResult} selectedRegime={selectedRegime} />
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard eyebrow="Tax option" title={`${selectedRegime === "new" ? "New" : "Old"} regime selected`} detail={effectiveResult.regime_comparison.tax_saving > 0 ? `${effectiveResult.regime_comparison.recommended_regime === "new" ? "New" : "Old"} regime is lower by ${formatINR(effectiveResult.regime_comparison.tax_saving)} on the current information.` : "Both options are currently nearly equal. Review your choice before filing."} href="/file/regime" event="review_regime_opened" />
            <SummaryCard eyebrow="Likely ITR form" title={`${likelyForm} · Provisional`} detail={effectiveResult.profile.routing_reasons[0] ?? "Based on the profile and income sources currently added."} href="/file/start" event="review_itr_form_opened" />
            <SummaryCard eyebrow="Filing readiness" title={requiredCount ? `${requiredCount} required ${requiredCount === 1 ? "action" : "actions"}` : "Ready for the next check"} detail={`${rowSummary.missing} optional sources missing · ${deductionSummary.needsProof} tax-saving items need supporting information.`} href="#required-actions" event="review_document_status_opened" />
          </div>

          <div id="required-actions">
            <ActionSection attention={rowSummary.attention} missing={rowSummary.missing} itrNeedsReview={itrNeedsReview} />
          </div>
          <DocumentDetails rows={rows} paid={isPaid} />

          <Card>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tax-saving items to review</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{deductionSummary.claimed} claimed · {deductionSummary.needsProof} need supporting information</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Only claim eligible items that occurred and can be supported. Items marked not applicable are excluded from the current facts or regime.</p>
            <Link href="/file/deductions" onClick={() => trackEvent("review_tax_saving_items_opened")} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Review tax-saving information <ArrowRight className="size-4" aria-hidden /></Link>
          </Card>

          {isPaid ? (
            <>
              <PaidDetails result={effectiveResult} selectedRegime={selectedRegime} deductionSummary={deductionSummary} />
              <Card className="border-emerald-200 bg-emerald-50/40">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-6 shrink-0 text-emerald-700" aria-hidden />
                  <div><h2 className="text-lg font-bold text-slate-950">Your detailed filing package is active</h2><p className="mt-1 text-sm leading-6 text-slate-600">Continue to the Guided Tax Check, then use your screen-by-screen Income Tax Portal guide.</p></div>
                </div>
                <Button href={requiredCount ? "#required-actions" : "/file/advisor"} onClick={() => trackEvent("review_guided_check_clicked")} className="mt-5">
                  {requiredCount ? `Review ${requiredCount} Required ${requiredCount === 1 ? "Action" : "Actions"}` : "Continue to Guided Tax Check"}
                </Button>
              </Card>
            </>
          ) : (
            <Card recommended className="bg-gradient-to-br from-white to-blue-50/60">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{recommendedPlan.name} recommended</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">Ready to complete your filing package?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Choose a plan to unlock the detailed filing summary, complete source-by-source checks and use the screen-by-screen Income Tax Portal guide.</p>
              <p className="mt-3 text-sm font-semibold text-slate-800">{recommendedPlanId === "pro" ? "Recommended because investment or additional-income information needs guided checks." : "Suitable for a straightforward salary return based on the information added."}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/file/checkout/plans" onClick={() => trackEvent("review_plans_clicked")}>View Filing Plans</Button>
                <Button href="/file/income" variant="secondary">Review My Information</Button>
              </div>
            </Card>
          )}

          <Card className="bg-slate-50">
            <div className="flex items-start gap-3">
              <CircleHelp className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div><h2 className="font-bold text-slate-950">Need help with this check?</h2><p className="mt-1 text-sm leading-6 text-slate-600">See plain-language help for documents, tax options and the next filing step.</p><Link href="/help" onClick={() => trackEvent("review_help_opened")} className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">Open Help</Link></div>
            </div>
          </Card>
          <p className="mb-24 flex items-start gap-2 text-xs leading-5 text-slate-500 sm:mb-6"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />Your information stays tied to the active taxpayer profile. Review the final values before filing on the Income Tax Portal. <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacy</Link></p>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Button href="/file/regime" variant="ghost">Back</Button>
          <Button href={!effectiveResult ? "/file/income" : isPaid ? "/file/advisor" : "/file/checkout/plans"}>
            {!effectiveResult ? "Review Income & Tax Savings" : isPaid ? "Continue to Guided Tax Check" : "View Filing Plans"}
          </Button>
        </div>
      </div>
    </FilingLayout>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <FilingLayout variant="wide">
          <Progress />
          <h1 className="text-3xl font-bold text-slate-950">Your final tax check</h1>
          <p className="mt-2 text-slate-600">Preparing your final tax check…</p>
        </FilingLayout>
      }
    >
      <ReviewDashboard />
    </Suspense>
  );
}
