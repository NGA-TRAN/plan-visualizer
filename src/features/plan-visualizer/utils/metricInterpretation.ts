import type {
  PlanInspection,
  PlanViewCapabilities,
  ProfileOptions,
} from "plan-viz";
import type { PlanViewSettings } from "./planView";

/** Find supported profiles that increase comparable observations. */
async function suggestMetricInterpretation(
  inspectPlan: typeof import("plan-viz").inspectPlan,
  plan: string,
  settings: Pick<
    PlanViewSettings,
    "display" | "metric" | "interpretation" | "input"
  >,
  inspection: PlanInspection,
  capabilities: PlanViewCapabilities,
): Promise<ProfileOptions | null> {
  if (settings.display === "off" || inspection.status !== "ready") return null;
  const selected = inspection.metrics.find(
    (metric) => metric.name === settings.metric,
  );
  if (!selected?.present) return null;

  let comparableCount = selected.comparableCount;
  let suggestion: ProfileOptions | null = null;
  const checkComparison = async (interpretation: ProfileOptions) => {
    const candidate = await inspectPlan(plan, {
      input: settings.input,
      interpretation,
    });
    const count =
      candidate.status === "ready"
        ? (candidate.metrics.find((metric) => metric.name === settings.metric)
            ?.comparableCount ?? 0)
        : 0;
    if (count > comparableCount) {
      comparableCount = count;
      suggestion = { ...interpretation };
    }
  };
  const interpretation = { ...settings.interpretation };
  if (!interpretation.metricProfile) {
    const profile = capabilities.profiles.find(
      (profile) => profile.component === "metric",
    );
    if (profile) {
      interpretation.metricProfile = profile.id;
      await checkComparison(interpretation);
    }
  }
  if (!interpretation.exportProfile && inspection.document.kind !== "single") {
    const profile = capabilities.profiles.find(
      (profile) => profile.component === "exporter",
    );
    if (profile) {
      interpretation.exportProfile = profile.id;
      await checkComparison(interpretation);
    }
  }
  return suggestion;
}

/** Apply supported defaults only when they unlock additional comparable values. */
export async function resolveMetricInterpretation(
  library: typeof import("plan-viz"),
  plan: string,
  settings: PlanViewSettings,
): Promise<PlanViewSettings> {
  if (
    settings.display === "off" ||
    settings.automaticInterpretation === false ||
    (settings.interpretation.metricProfile &&
      settings.interpretation.exportProfile)
  )
    return settings;
  const inspection = await library.inspectPlan(plan, {
    input: settings.input,
    interpretation: settings.interpretation,
  });
  const suggestion = await suggestMetricInterpretation(
    library.inspectPlan,
    plan,
    settings,
    inspection,
    library.getPlanViewCapabilities(),
  );
  return suggestion ? { ...settings, interpretation: suggestion } : settings;
}
