import {
  type InputSelection,
  type MetricDisplay,
  type PaletteId,
  type PlanViewOptions,
  type ProfileOptions,
  type PlanViewCapabilities,
} from "plan-viz";

export const DISPLAY_OPTIONS = [
  { id: "off", label: "Normal" },
  { id: "labels", label: "Labels" },
  { id: "heatmap", label: "Labels + heatmap" },
] as const;

/** Preferences are retained even when a mode hides a control. */
export interface PlanViewSettings {
  display: MetricDisplay;
  metric: string;
  palette: PaletteId;
  interpretation: ProfileOptions;
  /** Preserve old shared views; new interactions use automatic interpretation. */
  automaticInterpretation?: boolean;
  cohort?: string;
  input?: InputSelection;
}

export const DEFAULT_PLAN_VIEW: PlanViewSettings = {
  display: "off",
  metric: "elapsed_compute",
  palette: "orange",
  interpretation: {},
  automaticInterpretation: true,
};

export function planViewOptions(settings: PlanViewSettings): PlanViewOptions {
  const { display, metric, palette, cohort, interpretation, input } = settings;
  return {
    input,
    interpretation,
    metrics:
      display === "off"
        ? { display }
        : display === "labels"
          ? { display, metric, cohort }
          : { display, metric, palette, cohort },
  };
}

export function isPlanViewSettings(
  value: unknown,
  capabilities: PlanViewCapabilities,
): value is PlanViewSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as Record<string, unknown>;
  if (
    settings.automaticInterpretation !== undefined &&
    typeof settings.automaticInterpretation !== "boolean"
  )
    return false;
  if (
    !capabilities.displays.some((d) => d.id === settings.display) ||
    !capabilities.metrics.some(
      (m) => m.name === settings.metric && m.placement === "operator",
    ) ||
    !capabilities.palettes.some((p) => p.id === settings.palette) ||
    !settings.interpretation ||
    typeof settings.interpretation !== "object" ||
    Array.isArray(settings.interpretation)
  )
    return false;
  for (const [key, id] of Object.entries(settings.interpretation)) {
    const component =
      key === "metricProfile"
        ? "metric"
        : key === "exportProfile"
          ? "exporter"
          : null;
    if (
      !capabilities.profiles.some(
        (p) => p.component === component && p.id === id,
      )
    )
      return false;
  }
  if (
    settings.cohort !== undefined &&
    (typeof settings.cohort !== "string" || !settings.cohort)
  )
    return false;
  if (settings.input !== undefined) {
    if (
      !settings.input ||
      typeof settings.input !== "object" ||
      Array.isArray(settings.input)
    )
      return false;
    const input = settings.input as Record<string, unknown>;
    if (
      input.section !== undefined &&
      (typeof input.section !== "number" ||
        !Number.isInteger(input.section) ||
        input.section < 1)
    )
      return false;
    if (
      input.variant !== undefined &&
      (typeof input.variant !== "string" || !input.variant)
    )
      return false;
  }
  return true;
}
