/** Funnel events per TRUST_CONVERSION §12 */
export type AnalyticsEventName =
  | "landing_cta_click"
  | "homepage_view"
  | "homepage_start_itr_clicked"
  | "homepage_form16_clicked"
  | "homepage_tool_clicked"
  | "homepage_plan_clicked"
  | "homepage_faq_opened"
  | "homepage_help_clicked"
  | "family_page_view"
  | "self_filing_selected"
  | "family_member_add_started"
  | "family_member_profile_created"
  | "existing_profile_selected"
  | "family_profile_continue_clicked"
  | "family_profile_remove_started"
  | "family_profile_remove_confirmed"
  | "family_help_opened"
  | "review_page_view"
  | "review_tax_result_viewed"
  | "review_required_action_opened"
  | "review_document_status_opened"
  | "review_tax_saving_items_opened"
  | "review_itr_form_opened"
  | "review_regime_opened"
  | "review_plan_recommendation_viewed"
  | "review_plans_clicked"
  | "review_guided_check_clicked"
  | "review_help_opened"
  | "import_started"
  | "import_mode_selected"
  | "import_estimate_submitted"
  | "form16_upload"
  | "regime_compare_completion"
  | "presubmit_checklist_green"
  | "paywall_view"
  | "plan_select"
  | "payment_success"
  | "value_stack_impression"
  /** McKinsey M3 — companion digital footprint / field-error rate (see 06_ANALYTICS_EVENTS.md) */
  | "companion_footprint_step_viewed"
  | "companion_field_action"
  | "companion_field_copy"
  | "companion_field_confusion"
  | "companion_wizard_completed";

export type AnalyticsEventProps = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface QueuedAnalyticsEvent {
  name: AnalyticsEventName;
  props?: AnalyticsEventProps;
  timestamp: number;
}
