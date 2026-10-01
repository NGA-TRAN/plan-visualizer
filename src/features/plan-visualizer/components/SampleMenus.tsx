import { SAMPLE_CATEGORIES, type SamplePlan } from "../data/samples";
import { cn } from "@/shared/utils/cn";

interface SampleMenusProps {
  samples: readonly SamplePlan[];
  selectedSampleId: string | null;
  onSelectSample: (id: string) => void;
}

export function SampleMenus({
  samples,
  selectedSampleId,
  onSelectSample,
}: SampleMenusProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3"
      aria-label="Sample plans"
    >
      {SAMPLE_CATEGORIES.map((category) => {
        const options = samples.filter(
          (sample) => sample.category === category.id,
        );
        const selected = options.find(
          (sample) => sample.id === selectedSampleId,
        );
        const groups = [...new Set(options.map((sample) => sample.group))];
        const renderOption = (sample: SamplePlan) => (
          <option key={sample.id} value={sample.id}>
            {sample.label}
          </option>
        );
        return (
          <label
            key={category.id}
            className="grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-1 items-center gap-2 sm:gap-1.5 min-w-0"
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {category.label}{" "}
              {"status" in category && (
                <span className="text-amber-700 dark:text-amber-400">
                  ({category.status})
                </span>
              )}
            </span>
            <select
              id={`sample-${category.id}`}
              value={selected?.id ?? ""}
              onChange={(event) => {
                if (event.target.value) onSelectSample(event.target.value);
              }}
              className={cn(
                "min-w-0 w-full h-9 rounded-lg border px-2 pr-6 text-xs truncate cursor-pointer",
                "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600",
                "focus:outline-none focus:ring-2 focus:ring-primary-500",
                selected &&
                  "border-primary-400 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950 dark:text-primary-300",
              )}
            >
              <option value="" disabled>
                Choose a sample…
              </option>
              {groups.map((group) =>
                group ? (
                  <optgroup key={group} label={group}>
                    {options
                      .filter((sample) => sample.group === group)
                      .map(renderOption)}
                  </optgroup>
                ) : (
                  options.filter((sample) => !sample.group).map(renderOption)
                ),
              )}
            </select>
          </label>
        );
      })}
    </div>
  );
}
