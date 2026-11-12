import { useEffect, useRef, useState } from "react";
import type { PlanInspection, PlanViewCapabilities } from "plan-viz";
import { cn } from "@/shared/utils/cn";
import { DISPLAY_OPTIONS, type PlanViewSettings } from "../utils/planView";

interface PlanViewControlsProps {
  plan: string;
  settings: PlanViewSettings;
  onChange: (settings: PlanViewSettings) => void;
  isSample: boolean;
  onHeightChange?: (height: number) => void;
}

const selectClass =
  "h-8 min-w-0 max-w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200";
const fieldClass =
  "flex min-w-0 items-center gap-2 text-xs text-gray-600 dark:text-gray-300";

export function PlanViewControls({
  plan,
  settings,
  onChange,
  isSample,
  onHeightChange,
}: PlanViewControlsProps) {
  const controlsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!controlsRef.current || !onHeightChange) return;
    const observer = new ResizeObserver(([entry]) =>
      onHeightChange(Math.ceil(entry.contentRect.height)),
    );
    observer.observe(controlsRef.current);
    return () => observer.disconnect();
  }, [onHeightChange]);
  const [capabilities, setCapabilities] = useState<PlanViewCapabilities | null>(
    null,
  );
  const [inspected, setInspected] = useState<{
    key: string;
    result?: PlanInspection;
    error?: string;
  } | null>(null);
  const key = JSON.stringify([
    plan,
    settings.interpretation,
    settings.input,
    settings.metric,
  ]);
  useEffect(() => {
    if (settings.display === "off") return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      import("plan-viz")
        .then(async (library) => {
          if (cancelled) return null;
          const capabilities = library.getPlanViewCapabilities();
          setCapabilities(capabilities);
          if (!plan.trim()) return null;
          const result = await library.inspectPlan(plan, {
            interpretation: settings.interpretation,
            input: settings.input,
          });
          if (cancelled) return null;
          return result;
        })
        .then(
          (result) => {
            if (!cancelled && result) setInspected({ key, result });
          },
          (error: unknown) => {
            if (!cancelled)
              setInspected({
                key,
                error:
                  error instanceof Error
                    ? error.message
                    : "Could not inspect this plan.",
              });
          },
        );
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    plan,
    settings.display,
    settings.interpretation,
    settings.input,
    settings.metric,
    key,
  ]);

  const inspection = inspected?.key === key ? inspected.result : undefined;
  const error = inspected?.key === key ? inspected.error : undefined;
  const available =
    inspection?.metrics.filter(
      (m) => m.present && m.placement === "operator",
    ) ?? [];
  const metrics = capabilities?.metrics.filter(
    (m) =>
      m.placement === "operator" &&
      (m.name === settings.metric || available.some((a) => a.name === m.name)),
  );
  const paletteOptions = capabilities?.palettes ?? [
    {
      id: settings.palette,
      label: settings.palette[0].toUpperCase() + settings.palette.slice(1),
    },
  ];
  const metricOptions = metrics ?? [
    {
      name: settings.metric,
      label:
        settings.metric === "elapsed_compute"
          ? "Elapsed compute"
          : settings.metric,
    },
  ];
  const selectedMetric = available.find((m) => m.name === settings.metric);
  const section = inspection?.input.sections.find(
    (s) => s.number === (settings.input?.section ?? 1),
  );
  const variants = section?.variants.filter((v) => v.kind === "physical") ?? [];
  const change = (patch: Partial<PlanViewSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <div ref={controlsRef} className="mt-3 space-y-2 shrink-0">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <span
            id="display-label"
            className="text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            Display
          </span>
          <div
            className="hidden sm:flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600"
            role="radiogroup"
            aria-labelledby="display-label"
          >
            {DISPLAY_OPTIONS.map((display) => (
              <label
                key={display.id}
                className={cn(
                  "relative cursor-pointer rounded-md px-3 py-1.5 text-xs transition-colors",
                  settings.display === display.id
                    ? "bg-primary-600 text-white dark:bg-primary-500"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
              >
                <input
                  type="radio"
                  name="plan-display"
                  value={display.id}
                  checked={settings.display === display.id}
                  onChange={() => change({ display: display.id })}
                  className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span className="pointer-events-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4">
                  {display.id === "off"
                    ? "Normal"
                    : display.id === "labels"
                      ? "Labels"
                      : display.label}
                </span>
              </label>
            ))}
          </div>
          <select
            aria-label="Display"
            value={settings.display}
            onChange={(e) =>
              change({
                display: DISPLAY_OPTIONS.find((d) => d.id === e.target.value)!
                  .id,
              })
            }
            className={cn(selectClass, "sm:hidden flex-1")}
          >
            {DISPLAY_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id === "off"
                  ? "Normal"
                  : d.id === "labels"
                    ? "Labels"
                    : d.label}
              </option>
            ))}
          </select>
        </div>
        {settings.display !== "off" && (
          <>
            <label className={fieldClass}>
              Metric
              <select
                value={settings.metric}
                onChange={(e) =>
                  change({ metric: e.target.value, cohort: undefined })
                }
                className={cn(selectClass, "w-32 sm:w-auto")}
              >
                {metricOptions.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.label}
                    {inspection?.status === "ready" &&
                    !available.some((a) => a.name === m.name)
                      ? " (not reported)"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            {settings.display === "heatmap" && (
              <label className={fieldClass}>
                Color
                <select
                  value={settings.palette}
                  onChange={(e) =>
                    change({
                      palette: paletteOptions.find(
                        (p) => p.id === e.target.value,
                      )!.id,
                    })
                  }
                  className={selectClass}
                >
                  {paletteOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selectedMetric && selectedMetric.cohorts.length > 1 && (
              <label className={fieldClass}>
                Comparison group
                <select
                  value={settings.cohort ?? ""}
                  onChange={(e) =>
                    change({ cohort: e.target.value || undefined })
                  }
                  className={selectClass}
                >
                  <option value="">Choose a group…</option>
                  {selectedMetric.cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
      </div>
      {settings.display !== "off" && (
        <>
          {inspection && inspection.input.sections.length > 1 && (
            <label className={fieldClass}>
              Plan section
              <select
                className={selectClass}
                value={settings.input?.section ?? ""}
                onChange={(e) =>
                  change({
                    input: { section: Number(e.target.value) },
                    cohort: undefined,
                  })
                }
              >
                <option value="" disabled>
                  Choose a section…
                </option>
                {inspection.input.sections.map((s) => (
                  <option key={s.id} value={s.number}>
                    {s.title || `Plan ${s.number}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          {variants.length > 1 && (
            <label className={fieldClass}>
              Physical plan
              <select
                className={selectClass}
                value={settings.input?.variant ?? variants[0].id}
                onChange={(e) =>
                  change({
                    input: { ...settings.input, variant: e.target.value },
                    cohort: undefined,
                  })
                }
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {error}
            </p>
          )}
          {isSample && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sample measurements are synthetic.
            </p>
          )}
        </>
      )}
    </div>
  );
}
