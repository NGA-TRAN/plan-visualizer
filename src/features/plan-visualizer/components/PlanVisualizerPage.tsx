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

export function PlanVisualizerPage() {
  const { hash } = useLocation();
  const sharedLoadId = useRef(0);
  const [isLoadingSharedPlan, setIsLoadingSharedPlan] = useState(false);
  const [shareLinkError, setShareLinkError] = useState<string | null>(null);
  const [fitSharedPlan, setFitSharedPlan] = useState(false);
  // State
  const [inputText, setInputText] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  // Subscribe to theme changes from store - this ensures Excalidraw updates when theme toggle is clicked
  // The theme prop is passed to ExcalidrawCanvas which passes it to Excalidraw component
  const theme = useAppStore((state) => state.theme.resolved);
  const { notify } = useNotifications();

  // Conversion hook
  const { state, convert, displayScene } = usePlanConverter();

  // Load shared plans once per URL change. Ignore stale decodes after edits,
  // navigation, or StrictMode effect cleanup.
  useEffect(() => {
    const requestId = ++sharedLoadId.current;
    let cancelled = false;
    setShareLinkError(null);
    if (!hash.startsWith("#plan=")) {
      setIsLoadingSharedPlan(false);
      return;
    }
    setIsLoadingSharedPlan(true);
    readSharedPlan(hash).then(
      (plan) => {
        if (cancelled || requestId !== sharedLoadId.current || plan === null)
          return;
        setInputText(plan);
        setSelectedSampleId(null);
        setLoadedFileName(null);
        setFitSharedPlan(true);
        convert(plan);
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
    };
  }, [hash, convert]);

  const cancelSharedLoad = useCallback(() => {
    ++sharedLoadId.current;
    setIsLoadingSharedPlan(false);
    setShareLinkError(null);
    setFitSharedPlan(false);
  }, []);

  // Handle visualization
  const handleVisualize = useCallback(async () => {
    // T010: Empty input validation
    if (!inputText.trim()) {
      notify.warning("Please enter an execution plan to visualize.");
      return;
    }

    // T009: Wire up conversion
    const result = convert(inputText);

    if (result.success) {
      // Save plan to IndexedDB for offline access
      try {
        if (displayScene) {
          await savePlanToStorage(inputText.trim(), displayScene);
        }
      } catch (error) {
        // Don't fail visualization if storage fails, just log it
        console.warn("Failed to save plan to local storage:", error);
      }
    } else {
      // Error is already stored in state, also show toast
      notify.error(result.error || "Failed to convert plan");
    }
  }, [inputText, convert, notify, displayScene]);

  const handleInputChange = useCallback(
    (value: string) => {
      cancelSharedLoad();
      setInputText(value);
      setSelectedSampleId(null);
      setLoadedFileName(null);
    },
    [cancelSharedLoad],
  );

  const handleSelectSample = useCallback(
    (id: string) => {
      const sample = getSamplePlan(id);
      if (!sample) return;
      cancelSharedLoad();
      setSelectedSampleId(id);
      setLoadedFileName(null);
      setInputText(sample.plan);
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
    },
    [notify, cancelSharedLoad],
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
            minHeight: "150px",
            maxHeight: "80%",
          }}
          className="flex-shrink-0"
        >
          <Card className="p-3 sm:p-4 h-full">
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
          <ExcalidrawCanvas
            scene={displayScene}
            theme={theme}
            fitToContent={fitSharedPlan}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <strong>Tip:</strong> Paste your DataFusion EXPLAIN output or upload a
          plain-text plan file (.sql, .txt) into the input area.
        </p>
        <p>
          The visualizer supports Physical Execution Plans from Apache
          DataFusion.
        </p>
      </div>
    </div>
  );
}
