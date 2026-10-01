// Plan Visualizer Types
// Type definitions for the plan visualization feature

import type { SamplePlan } from "../data/samples";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

export type { ExcalidrawElement };

export interface ExcalidrawScene {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
}

/** Status of the plan conversion process */
export type ConversionStatus = "idle" | "converting" | "success" | "error";

/** State machine for conversion process */
export interface ConversionState {
  /** Current conversion status */
  status: ConversionStatus;

  /** Error message if status is 'error' */
  errorMessage: string | null;

  /** Converted Excalidraw elements if status is 'success' */
  elements: readonly ExcalidrawElement[] | null;

  /** Previous successful elements (preserved on error for fallback) */
  previousElements: readonly ExcalidrawElement[] | null;

  /** Full Excalidraw scene (as returned by plan-viz), including appState */
  scene: ExcalidrawScene | null;

  /** Previous successful scene (preserved on error for fallback) */
  previousScene: ExcalidrawScene | null;
}

/** Result returned by the plan converter */
export interface ConversionResult {
  /** Whether conversion was successful */
  success: boolean;

  /** Converted elements if successful */
  elements?: readonly ExcalidrawElement[];

  /** Error message if failed */
  error?: string;

  /** Number of nodes in the plan (for performance warnings) */
  nodeCount?: number;
}

/** Props for PlanInput component */
export interface PlanInputProps {
  /** Current input text value */
  value: string;

  /** Callback when input text changes */
  onChange: (value: string) => void;

  /** Callback when user clicks Visualize */
  onVisualize: () => void;

  /** Whether conversion is in progress */
  isLoading?: boolean;

  /** Error message to display inline */
  error?: string | null;

  /** Sample plans shown in the three category menus */
  samples?: ReadonlyArray<SamplePlan>;

  /** Currently selected sample id, if the input still matches that sample */
  selectedSampleId?: string | null;

  /** Callback when the user picks a sample from the menu */
  onSelectSample?: (id: string) => void;

  /** Name of the last uploaded plan file, if any */
  loadedFileName?: string | null;

  /** Callback when the user selects or drops a plan file */
  onUploadFile?: (file: File) => void;
}

/** Props for ExcalidrawCanvas component */
export interface ExcalidrawCanvasProps {
  /** Full scene (elements + appState) to render in the canvas */
  scene: ExcalidrawScene | null;

  /** Fit each newly visualized plan into the viewport. */
  fitToContent?: boolean;

  /** Current theme (light/dark) */
  theme?: "light" | "dark";
}

/** Initial empty conversion state */
export const initialConversionState: ConversionState = {
  status: "idle",
  errorMessage: null,
  elements: null,
  previousElements: null,
  scene: null,
  previousScene: null,
};

/** Maximum recommended nodes before showing performance warning */
export const NODE_WARNING_THRESHOLD = 100;
