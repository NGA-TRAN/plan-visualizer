// PlanInput Component
// Text input area for DataFusion execution plans with Visualize button

import { useRef, useState, useCallback } from "react";
import { Button } from "@/shared/components";
import { Play, FileText, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { PlanInputProps } from "../types";

export function PlanInput({
  value,
  onChange,
  onVisualize,
  error = null,
  samples = [],
  selectedSampleId = null,
  onSelectSample,
  loadedFileName = null,
  onUploadFile,
}: PlanInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to visualize
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onVisualize();
    }
  };

  const processFile = useCallback(
    (file: File | undefined) => {
      if (!file || !onUploadFile) return;
      onUploadFile(file);
    },
    [onUploadFile],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!onUploadFile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!onUploadFile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <label
          htmlFor="plan-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Execution Plan
        </label>
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          {onUploadFile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql,.txt,text/plain"
                className="sr-only"
                id="plan-file-upload"
                onChange={handleFileInputChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs h-8 px-2.5 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload file
              </Button>
              {loadedFileName && (
                <span
                  className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[180px]"
                  title={loadedFileName}
                >
                  {loadedFileName}
                </span>
              )}
            </>
          )}
          {samples.length > 0 && onSelectSample && (
            <label className="flex items-center gap-1.5 min-w-0">
              <FileText className="w-3 h-3 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <span className="sr-only">Load a sample</span>
              <select
                id="sample-plan"
                value={selectedSampleId ?? ""}
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectSample(e.target.value);
                  }
                }}
                className={cn(
                  "max-w-[220px] sm:max-w-[280px] truncate text-xs",
                  "bg-transparent border-0 p-0 pr-6",
                  "text-primary-600 dark:text-primary-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 rounded",
                  "cursor-pointer",
                )}
              >
                <option value="" disabled>
                  Load a sample…
                </option>
                {Array.from(new Set(samples.map((sample) => sample.group))).map(
                  (group) => (
                    <optgroup key={group} label={group}>
                      {samples
                        .filter((sample) => sample.group === group)
                        .map((sample) => (
                          <option key={sample.id} value={sample.id}>
                            {sample.label}
                          </option>
                        ))}
                    </optgroup>
                  ),
                )}
              </select>
            </label>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div
        className={cn(
          "relative flex-1 overflow-auto rounded-lg",
          isDragOver &&
            "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          id="plan-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Paste or drop a plan file here...\n\nExample 1 (Physical Plan only):\nProjectionExec: expr=[id@0 as id]\n  FilterExec: id@0 > 100\n    ParquetExec: file_groups={...}\n\nExample 2 (Full EXPLAIN output):\nEXPLAIN SELECT * FROM dim;\n+---------------+---------------------------------------------------------------------------------------------------------------------+\n| plan_type     | plan                                                                                                                |\n+---------------+---------------------------------------------------------------------------------------------------------------------+\n| logical_plan  | TableScan: dim2_parquet projection=[d_dkey, env, service, host]                                                     |\n| physical_plan | DataSourceExec: file_groups={1 groups: [[d_1.parquet]]}, projection=[d_dkey, env, service, host], file_type=parquet |\n+---------------+---------------------------------------------------------------------------------------------------------------------+`}
          className={cn(
            "w-full h-full min-h-[150px] sm:min-h-[200px] p-3 sm:p-4 font-mono text-xs sm:text-sm",
            "bg-gray-50 dark:bg-gray-800/50",
            "border rounded-lg resize-none",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-colors",
            // Prevent zoom on iOS when focusing input
            "text-base sm:text-sm",
            // Horizontal scrollbar - no word wrap
            "whitespace-pre overflow-x-auto overflow-y-auto",
            error
              ? "border-red-300 dark:border-red-700"
              : "border-gray-200 dark:border-gray-700",
          )}
          wrap="off"
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
          Press{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
            Ctrl
          </kbd>
          +
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
            Enter
          </kbd>{" "}
          to visualize
        </p>
        <Button
          onClick={onVisualize}
          isLoading={false}
          className="gap-2 w-full sm:w-auto"
        >
          <Play className="w-4 h-4" />
          Visualize
        </Button>
      </div>
    </div>
  );
}
