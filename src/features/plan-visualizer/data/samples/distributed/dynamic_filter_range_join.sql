┌───── DistributedExec
│ CoalescePartitionsExec
│   [Stage 2] => NetworkCoalesceExec: output_partitions=4, input_tasks=2
└──────────────────────────────────────────────────
  ┌───── Stage 2 ── tasks=2, partitions=2
  │ ProjectionExec: expr=[region@0 as region, count(Int64(1))@1 as n]
  │   AggregateExec: mode=FinalPartitioned, gby=[region@0 as region], aggr=[count(Int64(1))]
  │     [Stage 1] => NetworkShuffleExec: output_partitions=2, input_tasks=2
  └──────────────────────────────────────────────────
    ┌───── Stage 1 ── tasks=2, partitions=4
    │ RepartitionExec: partitioning=Hash([region@0], 4), input_partitions=2
    │   AggregateExec: mode=Partial, gby=[region@0 as region], aggr=[count(Int64(1))]
    │     HashJoinExec: mode=Partitioned, join_type=Inner, on=[(catalog_key@1, event_key@0)], projection=[region@0]
    │       FilterExec: category@1 = sensor, projection=[region@0, catalog_key@2]
    │         DistributedLeafExec:
    │           t0: DataSourceExec: file_groups={2 groups: [[fixtures/catalog/catalog_key=A/data0.parquet], [fixtures/catalog/catalog_key=C/data0.parquet]]}, projection=[region, category, catalog_key], output_partitioning=Range([catalog_key@2 ASC NULLS LAST], [(C)], 2), file_type=parquet, predicate=category@1 = sensor, pruning_predicate=category_null_count@2 != row_count@3 AND category_min@0 <= sensor AND sensor <= category_max@1, required_guarantees=[category in (sensor)]
    │           t1: DataSourceExec: file_groups={2 groups: [[fixtures/catalog/catalog_key=B/data0.parquet], [fixtures/catalog/catalog_key=D/data0.parquet]]}, projection=[region, category, catalog_key], output_partitioning=Range([catalog_key@2 ASC NULLS LAST], [(C)], 2), file_type=parquet, predicate=category@1 = sensor, pruning_predicate=category_null_count@2 != row_count@3 AND category_min@0 <= sensor AND sensor <= category_max@1, required_guarantees=[category in (sensor)]
    │       DistributedLeafExec:
    │         t0: DataSourceExec: file_groups={2 groups: [[fixtures/events/event_key=A/data0.parquet], [fixtures/events/event_key=C/data0.parquet]]}, projection=[event_key], output_partitioning=Range([event_key@0 ASC NULLS LAST], [(C)], 2), file_type=parquet, predicate=DynamicFilter [ event_key@2 >= A AND event_key@2 <= A AND event_key@2 IN (SET) ([<values>]) ], dynamic_rg_pruning=eligible, pruning_predicate=event_key_null_count@1 != row_count@2 AND event_key_max@0 >= A AND event_key_null_count@1 != row_count@2 AND event_key_min@3 <= A AND event_key_null_count@1 != row_count@2 AND event_key_min@3 <= A AND A <= event_key_max@0, required_guarantees=[event_key in (A)]
    │         t1: DataSourceExec: file_groups={2 groups: [[fixtures/events/event_key=B/data0.parquet], [fixtures/events/event_key=D/data0.parquet]]}, projection=[event_key], output_partitioning=Range([event_key@0 ASC NULLS LAST], [(C)], 2), file_type=parquet, predicate=DynamicFilter [ event_key@2 >= B AND event_key@2 <= B AND event_key@2 IN (SET) ([<values>]) ], dynamic_rg_pruning=eligible, pruning_predicate=event_key_null_count@1 != row_count@2 AND event_key_max@0 >= B AND event_key_null_count@1 != row_count@2 AND event_key_min@3 <= B AND event_key_null_count@1 != row_count@2 AND event_key_min@3 <= B AND B <= event_key_max@0, required_guarantees=[event_key in (B)]
    └──────────────────────────────────────────────────
