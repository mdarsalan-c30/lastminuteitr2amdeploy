"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Loader2,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { FilingLayout } from "@/components/filing/FilingLayout";
import { Banner, Button } from "@/components/filing/ui";
import { trackEvent } from "@/lib/analytics";
import {
  createFamilyProfile,
  deleteFamilyProfile,
  getActiveProfileId,
  restoreWorkspace,
  saveDraftToProfile,
  setActiveProfileId,
  switchToProfile,
  type FamilyProfileSummary,
} from "@/lib/family/client";
import type { PlanId } from "@/lib/payments/plans";
import { useDraftStore } from "@/lib/store/draft";

const STEPS = [
  "Who Are You Filing For?",
  "About You",
  "Add Documents",
  "Income & Tax Savings",
  "Compare Tax Options",
  "Final Tax Check",
  "Guided Tax Check",
  "Plan & Portal Guide",
] as const;

const RELATIONSHIP_OPTIONS = [
  { value: "father", label: "Parent" },
  { value: "spouse", label: "Spouse" },
  { value: "son", label: "Adult child" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other family member" },
] as const;

const RELATIONSHIP_LABELS: Record<string, string> = {
  self: "My ITR",
  spouse: "Spouse",
  father: "Parent",
  mother: "Parent",
  son: "Adult child",
  daughter: "Adult child",
  sibling: "Sibling",
  other: "Family member",
  client: "Family member",
};

type FamilyForm = {
  name: string;
  relationship: string;
  pan: string;
  consent: boolean;
};

const EMPTY_FORM: FamilyForm = {
  name: "",
  relationship: "father",
  pan: "",
  consent: false,
};

function relationshipLabel(value: string): string {
  return RELATIONSHIP_LABELS[value] ?? "Family member";
}

function maskedPan(pan: string | null): string | null {
  if (!pan) return null;
  return `PAN ending ${pan.slice(-4)}`;
}

function progressLabel(profile: FamilyProfileSummary): string {
  if (profile.filingStatus === "filed") return "Return filed · Step 8 of 8";
  if (profile.hasDraft) return "Filing in progress · Continue from About You";
  return "Ready for About You · Step 2 of 8";
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "IT"
  );
}

export default function FamilyPortalPage() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [profiles, setProfiles] = useState<FamilyProfileSummary[] | null>(null);
  const [limit, setLimit] = useState(50);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savedState, setSavedState] = useState<"saved" | "saving">("saved");
  const [notice, setNotice] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FamilyForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [menuProfile, setMenuProfile] = useState<FamilyProfileSummary | null>(null);
  const [removeProfile, setRemoveProfile] = useState<FamilyProfileSummary | null>(null);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const persistedProfileId = getActiveProfileId();
      const workspace = await restoreWorkspace();
      if (!persistedProfileId) setActiveProfileId(null);
      setProfiles(workspace.profiles);
      setLimit(workspace.limit);
      setActiveId(
        persistedProfileId &&
          workspace.profiles.some((profile) => profile.id === persistedProfileId)
          ? persistedProfileId
          : null
      );
      setNeedsLogin(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/log in|sign in|unauthor/i.test(message)) {
        setNeedsLogin(true);
        setProfiles([]);
      } else {
        setLoadFailed(true);
        setProfiles([]);
      }
    }
  }, []);

  useEffect(() => {
    trackEvent("family_page_view");
    void load();
  }, [load]);

  useEffect(() => {
    if (!showAdd) return;
    firstFieldRef.current?.focus();

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setShowAdd(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showAdd]);

  const applyPaymentState = useCallback(async () => {
    const workspace = await restoreWorkspace();
    if (workspace.activeProfileUnlocked && workspace.activeUnlockedPlanId) {
      useDraftStore
        .getState()
        .setPaymentVerified(workspace.activeUnlockedPlanId as PlanId);
    } else {
      useDraftStore.setState({ paidPlanId: null, paymentVerifiedAt: null });
    }
  }, []);

  const selectProfile = useCallback(
    async (
      profile: FamilyProfileSummary,
      source: "self" | "existing" | "created"
    ): Promise<boolean> => {
      setBusyId(profile.id);
      setNotice(null);
      setSavedState("saving");
      try {
        await switchToProfile(profile.id);
        setActiveProfileId(profile.id);
        setActiveId(profile.id);
        await saveDraftToProfile(profile.id);
        await applyPaymentState();
        setSavedState("saved");
        setNotice(
          source === "created"
            ? `Filing profile created for ${profile.name}.`
            : source === "self"
              ? "Your filing profile is ready."
              : `${profile.name}'s filing profile is selected.`
        );
        return true;
      } catch {
        setSavedState("saved");
        setNotice("We could not open this filing profile. Your saved information has not changed.");
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [applyPaymentState]
  );

  const handleSelfSelection = async () => {
    if (needsLogin) {
      router.push("/auth/login");
      return;
    }

    trackEvent("self_filing_selected");
    let selfProfile = profiles?.find((profile) => profile.relationship === "self");
    if (!selfProfile) {
      await load();
      const workspace = await restoreWorkspace().catch(() => null);
      selfProfile = workspace?.profiles.find((profile) => profile.relationship === "self");
    }
    if (!selfProfile) {
      setNotice("We could not prepare your filing profile. Try again or get help.");
      return;
    }
    await selectProfile(selfProfile, "self");
  };

  const openAddFamilyMember = () => {
    if (needsLogin) {
      router.push("/auth/login");
      return;
    }
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowAdd(true);
    trackEvent("family_member_add_started");
  };

  const handleDialogTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
      )
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.consent) {
      setFormError("Confirm that you have permission before creating the filing profile.");
      return;
    }

    setAdding(true);
    setFormError(null);
    setSavedState("saving");
    try {
      const created = await createFamilyProfile({
        name: form.name,
        relationship: form.relationship,
        pan: form.pan || undefined,
      });
      await selectProfile(created, "created");
      setShowAdd(false);
      setForm(EMPTY_FORM);
      await load();
      setActiveId(created.id);
      setSavedState("saved");
      trackEvent("family_member_profile_created");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/already added|already exists/i.test(message)) {
        setFormError("A filing profile with this PAN already exists on your account.");
      } else {
        setFormError("We could not create the filing profile. Check the details and try again.");
      }
      setSavedState("saved");
    } finally {
      setAdding(false);
    }
  };

  const handleExistingProfile = async (profile: FamilyProfileSummary) => {
    trackEvent("existing_profile_selected", { has_saved_draft: profile.hasDraft });
    const selected = await selectProfile(profile, "existing");
    if (!selected) return;
    trackEvent("family_profile_continue_clicked", { source: "saved_profile" });
    router.push("/file/start");
  };

  const handleContinue = async () => {
    if (!activeId) return;
    setSavedState("saving");
    try {
      await saveDraftToProfile(activeId);
      setSavedState("saved");
      trackEvent("family_profile_continue_clicked", { source: "selected_profile_bar" });
      router.push("/file/start");
    } catch {
      setSavedState("saved");
      setNotice("We could not save this profile yet. Check your connection and try again.");
    }
  };

  const startRemove = (profile: FamilyProfileSummary) => {
    setMenuProfile(null);
    setRemoveProfile(profile);
    trackEvent("family_profile_remove_started");
  };

  const confirmRemove = async () => {
    if (!removeProfile) return;
    setBusyId(removeProfile.id);
    try {
      await deleteFamilyProfile(removeProfile.id);
      if (activeId === removeProfile.id) {
        setActiveProfileId(null);
        setActiveId(null);
      }
      setRemoveProfile(null);
      await load();
      trackEvent("family_profile_remove_confirmed");
    } catch {
      setNotice("We could not remove this filing profile. Your saved information has not changed.");
    } finally {
      setBusyId(null);
    }
  };

  const selectedProfile = profiles?.find((profile) => profile.id === activeId) ?? null;
  const selfProfile = profiles?.find((profile) => profile.relationship === "self") ?? null;
  const savedProfiles = profiles ?? [];

  return (
    <FilingLayout
      variant="wide"
      mirrorText="Choose the taxpayer first. Their documents, answers and filing progress stay in a separate profile."
    >
      <div className="mx-auto w-full max-w-5xl">
        <section
          aria-label="Step 1 of 8: Who Are You Filing For?"
          className="mb-8 rounded-2xl border border-[#DDE4E3] bg-[#F4FAF8] px-4 py-4 sm:px-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0e5f63]">
                Step 1 of 8
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Who Are You Filing For?
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">{savedState === "saving" ? "Saving…" : "Saved"}</span>
          </div>
          <div
            role="progressbar"
            aria-label="Step 1 of 8: Who Are You Filing For?"
            aria-valuemin={1}
            aria-valuemax={8}
            aria-valuenow={1}
            className="mt-3 h-2 overflow-hidden rounded-full bg-white"
          >
            <div className="h-full w-[12.5%] rounded-full bg-[#0e5f63]" />
          </div>
          <details className="mt-3 text-sm text-slate-600">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-semibold text-[#0e5f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2">
              View all steps <ChevronDown className="size-4" aria-hidden />
            </summary>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {STEPS.map((step, index) => (
                <li
                  key={step}
                  className={index === 0 ? "font-semibold text-[#0e5f63]" : "text-slate-500"}
                >
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </details>
        </section>

        <header className="mb-8 max-w-3xl">
          <h1 className="font-manrope text-[clamp(30px,4vw,44px)] font-bold leading-tight tracking-[-0.025em] text-slate-950">
            Whose ITR are you preparing?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Choose yourself or a family member. Each taxpayer gets a separate filing profile,
            documents and filing progress.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            The taxpayer will review, submit and e-verify the return using their own account on
            incometax.gov.in.
          </p>
        </header>

        {needsLogin && (
          <Banner variant="info">
            Log in to choose or create a filing profile. No empty profile will be created before
            you sign in.
          </Banner>
        )}

        {notice && (
          <Banner variant={/could not/i.test(notice) ? "warning" : "success"}>
            {notice}
          </Banner>
        )}

        {loadFailed && (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="font-semibold text-slate-950">We could not load your filing profiles</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your saved information has not been changed. Try again.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void load()}>Try Again</Button>
              <Button href="/help" variant="secondary">
                Get Help
              </Button>
            </div>
          </section>
        )}

        <section aria-labelledby="filing-choice-heading">
          <h2 id="filing-choice-heading" className="sr-only">
            Choose who you are filing for
          </h2>
          {profiles === null ? (
            <div aria-live="polite">
              <p className="mb-3 text-sm text-slate-500">Loading your filing profiles…</p>
              <div className="grid gap-5 md:grid-cols-2">
                {[0, 1].map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <article
                aria-selected={Boolean(selfProfile && selfProfile.id === activeId)}
                className={`flex min-h-64 flex-col rounded-2xl border p-6 transition ${
                  selfProfile && selfProfile.id === activeId
                    ? "border-[#0e5f63] bg-[#F1FAF8] ring-2 ring-[#0e5f63]/10"
                    : "border-slate-200 bg-white hover:border-[#91BDB8]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-[#E8F3F1] text-[#0e5f63]">
                    <UserRound className="size-6" aria-hidden />
                  </span>
                  {selfProfile?.id === activeId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF2ED] px-2.5 py-1 text-xs font-bold text-[#0e5f63]">
                      <Check className="size-3.5" aria-hidden /> Selected
                    </span>
                  )}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">My own ITR</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  Prepare and review your own income-tax return.
                </p>
                <Button
                  onClick={() => void handleSelfSelection()}
                  disabled={busyId === selfProfile?.id}
                  className="mt-6 w-full min-h-12"
                >
                  {busyId === selfProfile?.id ? (
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  ) : null}
                  Continue with My ITR
                </Button>
              </article>

              <article className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#91BDB8]">
                <span className="flex size-12 items-center justify-center rounded-xl bg-[#E8F3F1] text-[#0e5f63]">
                  <UsersRound className="size-6" aria-hidden />
                </span>
                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  A family member&apos;s ITR
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  Prepare a separate return for your parent, spouse, adult child or another family
                  member.
                </p>
                <Button
                  onClick={openAddFamilyMember}
                  variant="secondary"
                  className="mt-6 min-h-12 w-full border-[#B8D8D3] text-[#0e5f63]"
                >
                  Add a Family Member
                </Button>
              </article>
            </div>
          )}
        </section>

        {savedProfiles.length > 0 && (
          <section className="mt-12" aria-labelledby="saved-profiles-title">
            <div className="mb-5">
              <h2 id="saved-profiles-title" className="text-2xl font-bold text-slate-950">
                Your saved filing profiles
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Continue an existing return or add another family member.
              </p>
            </div>

            <div className="grid gap-4">
              {savedProfiles.map((profile) => {
                const isSelected = profile.id === activeId;
                const pan = maskedPan(profile.pan);
                return (
                  <article
                    key={profile.id}
                    aria-selected={isSelected}
                    className={`rounded-2xl border p-5 ${
                      isSelected
                        ? "border-[#0e5f63] bg-[#F1FAF8] ring-2 ring-[#0e5f63]/10"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8F3F1] text-sm font-bold text-[#0e5f63]">
                          {initials(profile.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-slate-950">{profile.name}</h3>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF2ED] px-2 py-0.5 text-[11px] font-bold text-[#0e5f63]">
                                <Check className="size-3" aria-hidden /> Selected
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {relationshipLabel(profile.relationship)}
                            {pan ? ` · ${pan}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{progressLabel(profile)}</p>
                          {profile.unlocked && (
                            <p className="mt-1 text-xs font-medium text-[#0e5f63]">Plan active</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => void handleExistingProfile(profile)}
                          disabled={busyId === profile.id}
                          className="min-h-11 flex-1 sm:flex-none"
                        >
                          {busyId === profile.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                          ) : (
                            <ArrowRight className="mr-2 size-4" aria-hidden />
                          )}
                          Continue Filing
                        </Button>
                        <button
                          type="button"
                          onClick={() => setMenuProfile(profile)}
                          className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#91BDB8] hover:text-[#0e5f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2"
                          aria-label={`More options for ${profile.name}`}
                        >
                          <MoreHorizontal className="size-5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {!needsLogin && savedProfiles.length < limit && (
              <button
                type="button"
                onClick={openAddFamilyMember}
                className="mt-4 inline-flex min-h-11 items-center rounded-lg font-semibold text-[#0e5f63] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2"
              >
                Add another family member
              </button>
            )}
          </section>
        )}

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-[#FAFAFB] p-6">
            <CircleHelp className="size-6 text-[#0e5f63]" aria-hidden />
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Filing for a family member?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Create a separate profile for each taxpayer. Their documents, answers and filing
              progress remain separate.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <details>
                <summary className="cursor-pointer font-semibold text-[#0e5f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]">
                  How family filing works
                </summary>
                <p className="mt-2 text-slate-600">
                  Select one taxpayer at a time. LastminuteITR loads only that profile&apos;s saved
                  answers and documents.
                </p>
              </details>
              <details>
                <summary className="cursor-pointer font-semibold text-[#0e5f63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]">
                  How payment works for each profile
                </summary>
                <p className="mt-2 text-slate-600">
                  Each taxpayer&apos;s filing plan is selected and paid for separately.
                </p>
              </details>
              <Link
                href="/help"
                onClick={() => trackEvent("family_help_opened")}
                className="inline-flex min-h-11 items-center font-semibold text-[#0e5f63] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]"
              >
                Get help
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE4E3] bg-[#F4FAF8] p-6">
            <ShieldCheck className="size-6 text-[#0e5f63]" aria-hidden />
            <h2 className="mt-4 text-lg font-bold text-slate-950">You stay in control</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              LastminuteITR helps organise and prepare tax information. The taxpayer reviews the
              details and submits and e-verifies the return on incometax.gov.in.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Each filing profile keeps its documents and progress separate.
            </p>
            <Link
              href="/privacy"
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-[#0e5f63] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]"
            >
              Read how we use your data
            </Link>
          </div>
        </section>
      </div>

      {selectedProfile && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_-24px_rgba(15,23,42,.45)] backdrop-blur lg:left-56">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="hidden min-w-0 text-sm text-slate-600 sm:block">
              Selected: <strong className="text-slate-950">{selectedProfile.name}</strong>
            </p>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="hidden min-h-11 px-3 text-sm font-semibold text-[#0e5f63] hover:underline sm:inline-flex sm:items-center"
            >
              Choose a Different Profile
            </button>
            <Button onClick={() => void handleContinue()} className="min-h-12 w-full sm:w-auto">
              Continue to About You <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-family-title"
            onKeyDown={handleDialogTab}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="add-family-title" className="text-2xl font-bold text-slate-950">
                  Add a family member
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Create a separate filing profile for this taxpayer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63]"
                aria-label="Close add family member form"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-6 space-y-5">
              <label className="block text-sm font-semibold text-slate-800">
                Family member&apos;s first name
                <input
                  ref={firstFieldRef}
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0e5f63] focus:ring-2 focus:ring-[#0e5f63]/15"
                  aria-describedby="family-name-help"
                />
                <span id="family-name-help" className="mt-1.5 block text-xs font-normal text-slate-500">
                  This helps you identify the correct filing profile.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Relationship to you
                <select
                  value={form.relationship}
                  onChange={(event) => setForm({ ...form, relationship: event.target.value })}
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0e5f63] focus:ring-2 focus:ring-[#0e5f63]/15"
                >
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                PAN <span className="font-normal text-slate-500">(optional)</span>
                <input
                  value={form.pan}
                  onChange={(event) =>
                    setForm({ ...form, pan: event.target.value.toUpperCase() })
                  }
                  maxLength={10}
                  autoComplete="off"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#0e5f63] focus:ring-2 focus:ring-[#0e5f63]/15"
                  aria-describedby="family-pan-help"
                />
                <span id="family-pan-help" className="mt-1.5 block text-xs font-normal text-slate-500">
                  You can add this now or during the next step.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                  className="mt-0.5 size-5 rounded border-slate-300 text-[#0e5f63] focus:ring-[#0e5f63]"
                  aria-describedby="family-consent-help"
                />
                <span>
                  I have permission from this person to prepare their tax information using
                  LastminuteITR.
                  <span id="family-consent-help" className="mt-2 block text-xs text-slate-500">
                    They will review, submit and e-verify the return using their own Income Tax
                    Portal account.
                  </span>
                </span>
              </label>

              {formError && (
                <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowAdd(false)}
                  className="min-h-12"
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={adding}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0e5f63] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f63] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
                  Create Filing Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {menuProfile && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 sm:items-center sm:justify-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setMenuProfile(null)}
            aria-label="Close profile options"
          />
          <div className="relative w-full rounded-t-3xl bg-white p-5 sm:max-w-sm sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Profile options</h2>
              <button
                type="button"
                onClick={() => setMenuProfile(null)}
                className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-slate-100"
                aria-label="Close profile options"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuProfile(null);
                void handleExistingProfile(menuProfile);
              }}
              className="flex min-h-12 w-full items-center rounded-xl px-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Review taxpayer details
            </button>
            {menuProfile.relationship !== "self" && (
              <button
                type="button"
                onClick={() => startRemove(menuProfile)}
                className="flex min-h-12 w-full items-center rounded-xl px-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Remove profile
              </button>
            )}
          </div>
        </div>
      )}

      {removeProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-profile-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="remove-profile-title" className="text-xl font-bold text-slate-950">
              Remove this filing profile?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This will remove the saved information for this taxpayer from your LastminuteITR
              account. This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setRemoveProfile(null)}>
                Keep Profile
              </Button>
              <button
                type="button"
                onClick={() => void confirmRemove()}
                disabled={busyId === removeProfile.id}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Remove Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </FilingLayout>
  );
}
