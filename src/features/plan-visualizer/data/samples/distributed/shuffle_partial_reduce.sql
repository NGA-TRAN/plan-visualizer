┌───── DistributedExec
│ CoalescePartitionsExec
│   [Stage 2] => NetworkCoalesceExec: output_partitions=8, input_tasks=2
└──────────────────────────────────────────────────
  ┌───── Stage 2 ── tasks=2, partitions=8
  │ AggregateExec: mode=FinalPartitioned, gby=[number@0 as number], aggr=[]
  │   [Stage 1] => NetworkShuffleExec: output_partitions=4, input_tasks=3, sort_exprs=[number@0 ASC NULLS LAST]
  └──────────────────────────────────────────────────
    ┌───── Stage 1 ── tasks=3, partitions=24
    │ AggregateExec: mode=PartialReduce, gby=[number@0 as number], aggr=[]
    │   RepartitionExec: partitioning=Hash([number@0], 8), input_partitions=1, preserve_order=true
    │     SortExec: expr=[number@0 ASC NULLS LAST], preserve_partitioning=[true]
    │       NumbersExec: t0:[0-4), t1:[4-8), t2:[8-12)
    └──────────────────────────────────────────────────
