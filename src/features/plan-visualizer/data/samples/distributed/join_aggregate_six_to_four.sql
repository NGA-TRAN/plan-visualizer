┌───── DistributedExec
│ CoalescePartitionsExec
│   [Stage 2] => NetworkCoalesceExec: output_partitions=8, input_tasks=4
└──────────────────────────────────────────────────
  ┌───── Stage 2 ── tasks=4, partitions=8
  │ AggregateExec: mode=FinalPartitioned, gby=[region@0 as region], aggr=[count(*)]
  │   [Stage 1] => NetworkShuffleExec: output_partitions=2, input_tasks=6
  └──────────────────────────────────────────────────
    ┌───── Stage 1 ── tasks=6, partitions=8
    │ RepartitionExec: partitioning=Hash([region@0], 8), input_partitions=4
    │   AggregateExec: mode=Partial, gby=[region@0 as region], aggr=[count(*)]
    │     BudgetGuardExec(build<=8GiB): HashJoinExec: mode=Partitioned, join_type=Inner, on=[(record_id@0, record_id@0)]
    │       MeadowScanExec: file_groups={4 groups: [...]}, projection=[record_id, region, value], file_type=parquet
    │       BufferExec: capacity=_
    │         MeadowScanExec: file_groups={4 groups: [...]}, projection=[record_id, region, value], file_type=parquet
    └──────────────────────────────────────────────────
