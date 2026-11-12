┌───── DistributedExec
│ SortExec: TopK(fetch=10), expr=[events@1 DESC NULLS LAST, region@0 ASC NULLS LAST], preserve_partitioning=[false]
│   ProjectionExec: expr=[region@0 as region, count(Int64(1))@1 as events]
│     CoalescePartitionsExec
│       [Stage 2] => NetworkCoalesceExec: output_partitions=4, input_tasks=2
└──────────────────────────────────────────────────
  ┌───── Stage 2 ── tasks=2, partitions=4
  │ AggregateExec: mode=FinalPartitioned, gby=[region@0 as region], aggr=[count(Int64(1))], metrics=[elapsed_compute={0:2ms, 1:3ms}, output_rows={0:10, 1:10}, output_batches={0:2, 1:2}, output_bytes={0:160 B, 1:160 B}, peak_mem_used={0:8.0 KB, 1:8.0 KB}, spill_count={0:0, 1:0}, spilled_bytes={0:0 B, 1:0 B}, spilled_rows={0:0, 1:0}]
  │   [Stage 1] => NetworkShuffleExec: output_partitions=2, input_tasks=3, metrics=[elapsed_compute={0:4ms, 1:5ms}, output_rows={0:18, 1:18}, output_bytes={0:288 B, 1:288 B}]
  └──────────────────────────────────────────────────
    ┌───── Stage 1 ── tasks=3, partitions=4
    │ RepartitionExec: partitioning=Hash([region@0], 4), input_partitions=2, metrics=[elapsed_compute={0:1ms, 1:2ms, 2:0ns}, output_rows={0:16, 1:20, 2:0}, output_bytes={0:256 B, 1:320 B, 2:0 B}]
    │   AggregateExec: mode=Partial, gby=[region@0 as region], aggr=[count(Int64(1))], metrics=[elapsed_compute={0:8ms, 1:40ms, 2:0ns}, output_rows={0:16, 1:20, 2:0}, output_batches={0:2, 1:2, 2:0}, output_bytes={0:256 B, 1:320 B, 2:0 B}, peak_mem_used={0:16.0 KB, 1:32.0 KB, 2:0 B}, spill_count={0:0, 1:0, 2:0}, spilled_bytes={0:0 B, 1:0 B, 2:0 B}, spilled_rows={0:0, 1:0, 2:0}]
    │     FilterExec: status@1 = accepted, projection=[region@0], metrics=[elapsed_compute={0:3ms, 1:30ms, 2:0ns}, output_rows={0:9000, 1:36000, 2:0}, output_batches={0:2, 1:6, 2:0}, output_bytes={0:72000 B, 1:288000 B, 2:0 B}]
    │       DistributedLeafExec:
    │         t0: DataSourceExec: file_groups={2 groups: [[fixtures/events/task-0-part-0.parquet], [fixtures/events/task-0-part-1.parquet]]}, projection=[region, status], file_type=parquet, metrics=[elapsed_compute={0:20ms}, output_rows={0:12000}, output_batches={0:2}, output_bytes={0:192000 B}]
    │         t1: DataSourceExec: file_groups={2 groups: [[fixtures/events/task-1-part-0.parquet], [fixtures/events/task-1-part-1.parquet]]}, projection=[region, status], file_type=parquet, metrics=[elapsed_compute={1:200ms}, output_rows={1:48000}, output_batches={1:6}, output_bytes={1:768000 B}]
    │         t2: DataSourceExec: file_groups={2 groups: [[], []]}, projection=[region, status], file_type=parquet, metrics=[elapsed_compute={2:0ns}, output_rows={2:0}, output_batches={2:0}, output_bytes={2:0 B}]
    └──────────────────────────────────────────────────
