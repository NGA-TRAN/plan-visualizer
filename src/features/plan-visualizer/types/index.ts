// Plan Visualizer Types
// Type definitions for the plan visualization feature

// Excalidraw element type (simplified for our use case)
export interface ExcalidrawElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  [key: string]: unknown
}

/** Status of the plan conversion process */
export type ConversionStatus = 'idle' | 'converting' | 'success' | 'error'

/** State machine for conversion process */
export interface ConversionState {
  /** Current conversion status */
  status: ConversionStatus
  
  /** Error message if status is 'error' */
  errorMessage: string | null
  
  /** Converted Excalidraw elements if status is 'success' */
  elements: readonly ExcalidrawElement[] | null
  
  /** Previous successful elements (preserved on error for fallback) */
  previousElements: readonly ExcalidrawElement[] | null

  /** Full Excalidraw scene (as returned by plan-viz), including appState */
  scene: any | null

  /** Previous successful scene (preserved on error for fallback) */
  previousScene: any | null
}

/** Result returned by the plan converter */
export interface ConversionResult {
  /** Whether conversion was successful */
  success: boolean
  
  /** Converted elements if successful */
  elements?: readonly ExcalidrawElement[]
  
  /** Error message if failed */
  error?: string
  
  /** Number of nodes in the plan (for performance warnings) */
  nodeCount?: number
}

/** Props for PlanInput component */
export interface PlanInputProps {
  /** Current input text value */
  value: string
  
  /** Callback when input text changes */
  onChange: (value: string) => void
  
  /** Callback when user clicks Visualize */
  onVisualize: () => void
  
  /** Whether conversion is in progress */
  isLoading?: boolean
  
  /** Error message to display inline */
  error?: string | null
  
  /** Callback when user clicks sample plan button */
  onLoadSample?: () => void
  
  /** Callback when user clicks Load Sample 1 button */
  onLoadSample1?: () => void
  
  /** Callback when user clicks Load Sample 2 button */
  onLoadSample2?: () => void
}

/** Props for ExcalidrawCanvas component */
export interface ExcalidrawCanvasProps {
  /** Full scene (elements + appState) to render in the canvas */
  scene: any | null
  
  /** Current theme (light/dark) */
  theme?: 'light' | 'dark'
}

/** Initial empty conversion state */
export const initialConversionState: ConversionState = {
  status: 'idle',
  errorMessage: null,
  elements: null,
  previousElements: null,
  scene: null,
  previousScene: null,
}

/** Sample DataFusion execution plan for testing */
export const SAMPLE_PLAN = `ProjectionExec: expr=[id@0 as id, name@1 as name, amount@2 as amount]
  CoalesceBatchesExec: target_batch_size=8192
    FilterExec: amount@2 > 100
      RepartitionExec: partitioning=RoundRobinBatch(4)
        DataSourceExec: file_groups={1 group: [[orders.parquet]]}, projection=[id, name, amount]`

/** Maximum recommended nodes before showing performance warning */
export const NODE_WARNING_THRESHOLD = 100

/** Sample DataFusion execution plan 2 for testing (join operation with multiple file groups) */
export const SAMPLE_PLAN_2 = `EXPLAIN SELECT f.f_dkey, f.timestamp, f.value, d.service
FROM   dim2_parquet d, fact_parquet_sorted f
WHERE  d.d_dkey = f.f_dkey;
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| logical_plan  | Projection: f.f_dkey, f.timestamp, f.value, d.service                                                                                                                                                                                                                                                                                                                                                                                                              |
|               |   Inner Join: d.d_dkey = f.f_dkey                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|               |     SubqueryAlias: d                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|               |       TableScan: dim2_parquet projection=[d_dkey, service]                                                                                                                                                                                                                                                                                                                                                                                                         |
|               |     SubqueryAlias: f                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|               |       TableScan: fact_parquet_sorted projection=[f_dkey, timestamp, value]                                                                                                                                                                                                                                                                                                                                                                                         |
| physical_plan | ProjectionExec: expr=[f_dkey@1 as f_dkey, timestamp@2 as timestamp, value@3 as value, service@0 as service]                                                                                                                                                                                                                                                                                                                                                        |
|               |   CoalesceBatchesExec: target_batch_size=8192                                                                                                                                                                                                                                                                                                                                                                                                                      |
|               |     HashJoinExec: mode=CollectLeft, join_type=Inner, on=[(d_dkey@0, f_dkey@0)], projection=[service@1, f_dkey@2, timestamp@3, value@4]                                                                                                                                                                                                                                                                                                                             |
|               |       CoalescePartitionsExec                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|               |         DataSourceExec: file_groups={2 groups: [[d1.parquet], [d2.parquet]]}, projection=[d_dkey, service], file_type=parquet                                                                                                                                                                              |
|               |       DataSourceExec: file_groups={3 groups: [[f1.parquet], [f2.parquet], [f3.parquet]]}, projection=[f_dkey, timestamp, value], output_ordering=[f_dkey@0 ASC NULLS LAST, timestamp@1 ASC NULLS LAST], file_type=parquet, predicate=DynamicFilter [ empty ] |
|               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+`

