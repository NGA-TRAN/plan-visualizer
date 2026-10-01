┌───── DistributedExec
│ CoalescePartitionsExec
│   [Stage 3] => NetworkCoalesceExec: output_partitions=12, input_tasks=4
└──────────────────────────────────────────────────
  ┌───── Stage 3 ── tasks=4, partitions=12
  │ HashJoinExec: mode=Partitioned, join_type=Full, on=[(item_key@0, item_key@0)]
  │   [Stage 1] => NetworkShuffleExec: output_partitions=3, input_tasks=4
  │   [Stage 2] => NetworkShuffleExec: output_partitions=3, input_tasks=4
  └──────────────────────────────────────────────────
    ┌───── Stage 1 ── tasks=4, partitions=12
    │ RepartitionExec: partitioning=Hash([item_key@0], 12), input_partitions=2
    │   DistributedLeafExec:
    │     t0: DataSourceExec: file_groups={2 groups: [[fixtures/catalog/part-0.parquet:<int>..<int>], [fixtures/catalog/part-2.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    │     t1: DataSourceExec: file_groups={2 groups: [[fixtures/catalog/part-0.parquet:<int>..<int>, fixtures/catalog/part-1.parquet:<int>..<int>], [fixtures/catalog/part-2.parquet:<int>..<int>, fixtures/catalog/part-3.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    │     t2: DataSourceExec: file_groups={2 groups: [[fixtures/catalog/part-1.parquet:<int>..<int>], [fixtures/catalog/part-3.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    │     t3: DataSourceExec: file_groups={2 groups: [[fixtures/catalog/part-1.parquet:<int>..<int>, fixtures/catalog/part-2.parquet:<int>..<int>], [fixtures/catalog/part-3.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    └──────────────────────────────────────────────────
    ┌───── Stage 2 ── tasks=4, partitions=12
    │ RepartitionExec: partitioning=Hash([item_key@0], 12), input_partitions=2
    │   DistributedLeafExec:
    │     t0: DataSourceExec: file_groups={2 groups: [[fixtures/events/part-0.parquet:<int>..<int>], [fixtures/events/part-2.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    │     t1: DataSourceExec: file_groups={2 groups: [[fixtures/events/part-0.parquet:<int>..<int>], [fixtures/events/part-2.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    │     t2: DataSourceExec: file_groups={2 groups: [[fixtures/events/part-1.parquet:<int>..<int>], [fixtures/events/part-3.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    │     t3: DataSourceExec: file_groups={2 groups: [[fixtures/events/part-1.parquet:<int>..<int>], [fixtures/events/part-3.parquet:<int>..<int>]]}, projection=[item_key], file_type=parquet
    └──────────────────────────────────────────────────
