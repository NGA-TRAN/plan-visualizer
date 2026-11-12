// PlanVisualizerPage Component
// Main page orchestrating plan input, conversion, and visualization

import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/components";
import { useAppStore } from "@/store";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { PlanInput } from "./PlanInput";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";
import { usePlanConverter } from "../hooks/usePlanConverter";
import { useResizablePanels } from "../hooks/useResizablePanels";
import { SAMPLE_PLANS, getSamplePlan } from "../data/samples";
import { savePlanToStorage } from "@/features/offline/services/storageManager";
import { cn } from "@/shared/utils/cn";
import { readPlanFileAsText } from "../utils/readPlanFile";
import { readSharedPlan } from "../utils/sharePlan";
import { DEFAULT_PLAN_VIEW, type PlanViewSettings } from "../utils/planView";

export function PlanVisualizerPage() {
  const { hash } = useLocation();
  const sharedLoadId = useRef(0);
  const [isLoadingSharedPlan, setIsLoadingSharedPlan] = useState(false);
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  // State
  const [inputText, setInputText] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [viewSettings, setViewSettings] =
    useState<PlanViewSettings>(DEFAULT_PLAN_VIEW);
  // Subscribe to theme changes from store - this ensures Excalidraw updates when theme toggle is clicked
  // The theme prop is passed to ExcalidrawCanvas which passes it to Excalidraw component
  const theme = useAppStore((state) => state.theme.resolved);
  const { notify } = useNotifications();

  // Conversion hook
  const { state, convert, cancel, displayScene } = usePlanConverter();

  // Load shared plans once per URL change. Ignore stale decodes after edits,
  // navigation, or StrictMode effect cleanup.
  useEffect(() => {
    const requestId = ++sharedLoadId.current;
    cancel();
    let cancelled = false;
    setShareLinkError(null);
    if (!hash.startsWith("#plan=")) {
      setIsLoadingSharedPlan(false);
      return;
    }
    setIsLoadingSharedPlan(true);
    readSharedPlan(hash).then(
      async (shared) => {
        if (cancelled || requestId !== sharedLoadId.current || shared === null)
          return;
        setInputText(shared.plan);
        setViewSettings(shared.settings);
        setSelectedSampleId(null);
        setLoadedFileName(null);
        await convert(shared.plan, shared.settings);
        if (!cancelled && requestId === sharedLoadId.current)
          setIsLoadingSharedPlan(false);
      },
      (error: unknown) => {
        if (cancelled || requestId !== sharedLoadId.current) return;
        setShareLinkError(
          error instanceof Error
            ? error.message
            : "Could not open this shared plan.",
        );
        setIsLoadingSharedPlan(false);
      },
    );
    return () => {
      cancelled = true;
      cancel();
    };
  }, [hash, convert, cancel]);

  const cancelSharedLoad = useCallback(() => {
    ++sharedLoadId.current;
    setIsLoadingSharedPlan(false);
    setShareLinkError(null);
    cancel();
  }, [cancel]);

  // Handle visualization
  const handleVisualize = useCallback(async () => {
    // T010: Empty input validation
    if (!inputText.trim()) {
      notify.warning("Please enter an execution plan to visualize.");
      return;
    }

    // T009: Wire up conversion
    cancelSharedLoad();
    const result = await convert(inputText, viewSettings);
    if (!result) return;

    if (result.success) {
      // Save plan to IndexedDB for offline access
      try {
        if (result.scene) {
          await savePlanToStorage(inputText.trim(), result.scene);
        }
      } catch (error) {
        // Don't fail visualization if storage fails, just log it
        console.warn("Failed to save plan to local storage:", error);
      }
    } else {
      // Error is already stored in state, also show toast
      notify.error(result.error || "Failed to convert plan");
    }
  }, [inputText, viewSettings, convert, notify, cancelSharedLoad]);

  const handleInputChange = useCallback(
    (value: string) => {
      cancelSharedLoad();
      setInputText(value);
      setSelectedSampleId(null);
      setLoadedFileName(null);
      setViewSettings((previous) => ({
        ...previous,
        cohort: undefined,
        input: undefined,
        interpretation: selectedSampleId ? {} : previous.interpretation,
      }));
    },
    [cancelSharedLoad, selectedSampleId],
  );

  const handleSelectSample = useCallback(
    (id: string) => {
      const sample = getSamplePlan(id);
      if (!sample) return;
      cancelSharedLoad();
      setSelectedSampleId(id);
      setLoadedFileName(null);
      setInputText(sample.plan);
      setViewSettings((previous) => ({
        ...previous,
        interpretation: sample.interpretation ?? {},
        cohort: undefined,
        input: undefined,
      }));
    },
    [cancelSharedLoad],
  );

  const handleUploadFile = useCallback(
    async (file: File) => {
      cancelSharedLoad();
      const result = await readPlanFileAsText(file);
      if (!result.ok) {
        if (result.code === "too_large") {
          notify.warning(result.message);
        } else {
          notify.error(result.message);
        }
        return;
      }
      setSelectedSampleId(null);
      setLoadedFileName(result.fileName);
      setInputText(result.contents);
      setViewSettings((previous) => ({
        ...previous,
        interpretation: {},
        cohort: undefined,
        input: undefined,
      }));
    },
    [notify, cancelSharedLoad],
  );

  const handleViewSettingsChange = useCallback(
    (settings: PlanViewSettings) => {
      cancelSharedLoad();
      setViewSettings(settings);
    },
    [cancelSharedLoad],
  );

  // Resizable panels hook
  const { containerRef, inputHeight, isDragging, handleMouseDown } =
    useResizablePanels();

  return (
    <div className="px-2 sm:px-0">
      {/* Main Content - Resizable Layout */}
      <div
        ref={containerRef}
        className="flex flex-col gap-0 h-[calc(100vh-64px)]"
      >
        {/* Input Panel */}
        <div
          style={{
            height: `${inputHeight * 100}%`,
            maxHeight: "80%",
          }}
          className={cn(
            "flex-shrink-0",
            viewSettings.display === "off"
              ? "min-h-[450px] sm:min-h-[390px] lg:min-h-[340px]"
              : "min-h-[570px] sm:min-h-[470px] lg:min-h-[420px]",
          )}
        >
          <Card className="p-3 sm:p-4 h-full overflow-y-auto">
            {isLoadingSharedPlan && (
              <p role="status" className="mb-2 text-sm text-gray-500">
                Opening shared plan…
              </p>
            )}
            <PlanInput
              value={inputText}
              onChange={handleInputChange}
              onVisualize={handleVisualize}
              error={
                shareLinkError ??
                (state.status === "error" ? state.errorMessage : null)
              }
              samples={SAMPLE_PLANS}
              selectedSampleId={selectedSampleId}
              onSelectSample={handleSelectSample}
              loadedFileName={loadedFileName}
              onUploadFile={handleUploadFile}
              viewSettings={viewSettings}
              onViewSettingsChange={handleViewSettingsChange}
              isLoading={state.status === "converting"}
              metricReport={state.metricReport}
              diagnostics={state.diagnostics}
            />
          </Card>
        </div>

        {/* Resizer Handle */}
        <div
          className={cn(
            "h-1 bg-gray-200 dark:bg-gray-700 cursor-row-resize hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",
            isDragging && "bg-primary-500",
          )}
          onMouseDown={handleMouseDown}
          aria-label="Resize panels"
        />

        {/* Visualization Panel */}
        <div
          style={{
            flex: 1,
            minHeight: "200px",
          }}
          className="flex-shrink-0"
        >
          <ExcalidrawCanvas scene={displayScene} theme={theme} fitToContent />
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <strong>Tip:</strong> Paste your DataFusion EXPLAIN output or upload a
          plain-text plan file (.sql, .txt) into the input area.
        </p>
        <p>
          Explore single-node plans, custom operators, and distributed execution
          plans (beta), plus plans with metrics (alpha).
        </p>
      </div>
    </div>
  );
}
