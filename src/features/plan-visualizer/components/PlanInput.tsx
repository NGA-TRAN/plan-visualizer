// PlanInput Component
// Text input area for DataFusion execution plans with Visualize button

import { Button } from '@/shared/components'
import { Play, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { PlanInputProps } from '../types'
import { SAMPLE_PLAN } from '../types'

export function PlanInput({
  value,
  onChange,
  onVisualize,
  isLoading = false,
  error = null,
  onLoadSample,
}: PlanInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to visualize
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onVisualize()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label 
          htmlFor="plan-input" 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          DataFusion Execution Plan
        </label>
        {onLoadSample && (
          <button
            type="button"
            onClick={() => onChange(SAMPLE_PLAN)}
            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Load Sample
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <textarea
          id="plan-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Paste your DataFusion Physical Execution Plan here...\n\nExample 1 (Physical Plan only):\nProjectionExec: expr=[id@0 as id]\n  FilterExec: id@0 > 100\n    ParquetExec: file_groups={...}\n\nExample 2 (Full EXPLAIN output):\nEXPLAIN SELECT * FROM dim;\n+---------------+---------------------------------------------------------------------------------------------------------------------+\n| plan_type     | plan                                                                                                                |\n+---------------+---------------------------------------------------------------------------------------------------------------------+\n| logical_plan  | TableScan: dim2_parquet projection=[d_dkey, env, service, host]                                                     |\n| physical_plan | DataSourceExec: file_groups={1 groups: [[d_1.parquet]]}, projection=[d_dkey, env, service, host], file_type=parquet |\n+---------------+---------------------------------------------------------------------------------------------------------------------+`}
          className={cn(
            'w-full h-full min-h-[150px] sm:min-h-[200px] p-3 sm:p-4 font-mono text-xs sm:text-sm',
            'bg-gray-50 dark:bg-gray-800/50',
            'border rounded-lg resize-none',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors',
            // Prevent zoom on iOS when focusing input
            'text-base sm:text-sm',
            error
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-200 dark:border-gray-700'
          )}
          disabled={isLoading}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {value.length.toLocaleString()} chars
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd> to visualize
        </p>
        <Button
          onClick={onVisualize}
          isLoading={isLoading}
          disabled={isLoading}
          className="gap-2 w-full sm:w-auto"
        >
          <Play className="w-4 h-4" />
          Visualize
        </Button>
      </div>
    </div>
  )
}

