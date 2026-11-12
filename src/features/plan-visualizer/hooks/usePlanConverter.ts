// usePlanConverter Hook
// Handles conversion of DataFusion execution plans to Excalidraw format

import { useState, useCallback, useRef, useEffect } from "react";
import { planViewOptions, type PlanViewSettings } from "../utils/planView";
import {
  type ExcalidrawElement,
  type ExcalidrawScene,
  type ConversionState,
  type ConversionResult,
  initialConversionState,
  NODE_WARNING_THRESHOLD,
} from "../types";

/** Return type for the usePlanConverter hook */
export interface UsePlanConverterReturn {
  /** Current conversion state */
  state: ConversionState;

  /** Convert plan text to Excalidraw elements */
  convert: (
    planText: string,
    settings: PlanViewSettings,
  ) => Promise<ConversionResult | null>;
  cancel: () => void;

  /** Reset to initial state */
  reset: () => void;

  /** Check if there are elements to display (current or previous) */
  hasElements: boolean;

  /** Get elements to display (current or fallback to previous) */
  displayElements: readonly ExcalidrawElement[] | null;

  /** Get scene (elements + appState) to display (current or fallback to previous) */
  displayScene: ExcalidrawScene | null;
}

/**
 * Hook for converting DataFusion execution plans to Excalidraw format.
 * Handles error states and preserves previous successful visualizations.
 */
export function usePlanConverter(): UsePlanConverterReturn {
  const [state, setState] = useState<ConversionState>(initialConversionState);
  const requestId = useRef(0);
  useEffect(
    () => () => {
      ++requestId.current;
    },
    [],
  );
  const cancel = useCallback(() => {
    ++requestId.current;
    setState((prev) =>
      prev.status === "converting"
        ? { ...prev, status: prev.scene ? "success" : "idle" }
        : prev,
    );
  }, []);

  const convert = useCallback(
    async (
      planText: string,
      settings: PlanViewSettings,
    ): Promise<ConversionResult | null> => {
      const currentRequest = ++requestId.current;
      // Set converting state
      setState((prev) => ({
        ...prev,
        status: "converting",
        errorMessage: null,
      }));

      try {
        // Validate input
        const trimmedPlan = planText.trim();
        if (!trimmedPlan) {
          const error = "Please enter an execution plan to visualize.";
          setState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: error,
          }));
          return { success: false, error };
        }

        // Convert using plan-viz library (returns full Excalidraw JSON scene)
        // Load conversion code only when requested, keeping the input UI lightweight.
        const { convertPlanToExcalidraw, convertPlanView } =
          await import("plan-viz");
        if (currentRequest !== requestId.current) return null;
        const view =
          settings.display === "off" && !settings.input
            ? null
            : await convertPlanView(trimmedPlan, planViewOptions(settings));
        if (currentRequest !== requestId.current) return null;
        const result = view ? view.scene : convertPlanToExcalidraw(trimmedPlan);
        // plan-viz emits Excalidraw JSON, but its declarations use broader types
        // for fields such as arrowheads and element indexes. Keep that boundary here.
        const scene = result as unknown as ExcalidrawScene;
        const elements = scene.elements ?? [];
        const nodeCount = elements.length;

        // Calculate center and translate elements to the right to center them
        let centeredScene = scene;
        if (elements.length > 0) {
          const bounds = calculateElementBounds(elements);

          if (bounds) {
            // Calculate the center X of all elements
            const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;

            // Target center position - move elements so their center is at this X position
            // Using a fixed large value to ensure elements are moved well to the right
            const targetCenterX = 800;

            // Calculate how much to move elements to the right
            const offsetX = targetCenterX - centerX;

            // Only translate if offset is significant (more than 50px)
            if (Math.abs(offsetX) > 50) {
              // Translate all elements to the right to center them
              const translatedElements = elements.map((el) => {
                if (el.x !== undefined && typeof el.x === "number") {
                  return {
                    ...el,
                    x: el.x + offsetX,
                  };
                }
                return el;
              });

              // Update scene with translated elements
              centeredScene = {
                ...scene,
                elements: translatedElements,
              };
            }
          }
        }

        // Update state with success
        setState({
          status: "success",
          errorMessage: null,
          elements,
          previousElements: elements, // Update previous on success
          scene: centeredScene,
          previousScene: centeredScene,
          metricReport: view?.metrics ?? null,
          diagnostics:
            view?.diagnostics.map((diagnostic) => diagnostic.message) ?? [],
        });

        return {
          success: true,
          elements,
          nodeCount,
          scene: centeredScene,
        };
      } catch (err) {
        if (currentRequest !== requestId.current) return null;
        // Handle conversion error
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to parse execution plan. Please check the format.";

        setState((prev) => ({
          ...prev,
          status: "error",
          errorMessage,
          // Keep previousElements for fallback display
        }));

        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  const reset = useCallback(() => {
    ++requestId.current;
    setState(initialConversionState);
  }, []);

  // Determine which elements to display (current or previous as fallback)
  const displayElements = state.elements ?? state.previousElements;
  const displayScene = state.scene ?? state.previousScene ?? null;

  return {
    state,
    convert,
    cancel,
    reset,
    hasElements: displayElements !== null && displayElements.length > 0,
    displayElements,
    displayScene,
  };
}

/**
 * Calculate bounding box of all elements
 */
function calculateElementBounds(
  elements: readonly ExcalidrawElement[],
): { minX: number; maxX: number; minY: number; maxY: number } | null {
  if (!elements || elements.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    if (el.x !== undefined && typeof el.x === "number") {
      const elementWidth =
        el.width && typeof el.width === "number" ? el.width : 0;
      const elementHeight =
        el.height && typeof el.height === "number" ? el.height : 0;
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + elementWidth);
      if (el.y !== undefined && typeof el.y === "number") {
        minY = Math.min(minY, el.y);
        maxY = Math.max(maxY, el.y + elementHeight);
      }
    }
  });

  if (
    minX === Infinity ||
    maxX === -Infinity ||
    minY === Infinity ||
    maxY === -Infinity
  )
    return null;

  return { minX, maxX, minY, maxY };
}

/**
 * Check if the node count exceeds the warning threshold
 */
export function shouldShowPerformanceWarning(nodeCount: number): boolean {
  return nodeCount > NODE_WARNING_THRESHOLD;
}
