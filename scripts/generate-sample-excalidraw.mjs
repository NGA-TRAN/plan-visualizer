// Simple script to generate an Excalidraw JSON scene from the SAMPLE_PLAN
// and write it to public/sample.excalidraw so Vite can serve it as a static asset.

import { writeFileSync } from 'node:fs'
import { convertPlanToExcalidraw } from 'plan-viz'

// This MUST exactly match SAMPLE_PLAN in src/features/plan-visualizer/types/index.ts
const SAMPLE_PLAN = `ProjectionExec: expr=[id@0 as id, name@1 as name, amount@2 as amount]
  CoalesceBatchesExec: target_batch_size=8192
    FilterExec: amount@2 > 100
      RepartitionExec: partitioning=RoundRobinBatch(4)
        DataSourceExec: file_groups={1 group: [[orders.parquet]]}, projection=[id, name, amount]`

const scene = convertPlanToExcalidraw(SAMPLE_PLAN)

writeFileSync(
  // Vite serves everything in /public at the site root, so this will be available as /sample.excalidraw
  new URL('../public/sample.excalidraw', import.meta.url),
  JSON.stringify(scene, null, 2),
  'utf8',
)

console.log('sample.excalidraw written to public/sample.excalidraw')


