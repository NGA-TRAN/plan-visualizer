ProjectionExec: expr=[id@0 as id, name@1 as name, amount@2 as amount]
  CoalesceBatchesExec: target_batch_size=8192
    FilterExec: amount@2 > 100
      RepartitionExec: partitioning=RoundRobinBatch(4)
        DataSourceExec: file_groups={1 group: [[orders.parquet]]}, projection=[id, name, amount]
