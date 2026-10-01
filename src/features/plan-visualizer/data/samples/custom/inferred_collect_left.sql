TraceGuardExec(note="limit: high, mode=safe"): BudgetGuardExec(rows<=10000): HashJoinExec: mode=CollectLeft, join_type=Inner, on=[(@host@0, @host@0)], projection=[@host@0, value@1]
  MeadowScanExec: file_groups={1 group: [[context_01.ctx:0..1000]]}, projection=[@host], output_ordering=[@host@0 ASC], output_partitioning=UnknownPartitioning(1)
  BufferExec: capacity=_
    BrookScanExec: file_groups={4 groups: [[points_1.dat], [points_2.dat], [points_3.dat], [points_4.dat]]}, projection=[@host, value], output_partitioning=RoundRobinBatch(4)
