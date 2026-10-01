ProjectionExec: expr=[@host@0 as @host, date_bin(IntervalMonthDayNano { months: 0, days: 0, nanoseconds: 300000000000 }, timestamp@1) as time_bin]
  AggregateExec: mode=SinglePartitioned, gby=[@host@0 as @host, timestamp@1 as time_bin], aggr=[count(*) as total], ordering_mode=PartiallySorted([0, 1])
    BudgetGuardExec(fanout[enforce]>=500x@8000000rows, build[enforce]>=16.0GiB after 15s): HashJoinExec: mode=Partitioned, join_type=Inner, on=[(record_id@0, record_id@0)], projection=[@host@1, timestamp@2]
      MeadowScanExec: file_groups={48 groups: [[/sample/contexts/slice_with_a_long_distinguishing_name_01.ctx:0..1000], [/sample/contexts/slice_02.ctx:0..2000], [/sample/contexts/slice_47.ctx:0..3000], [/sample/contexts/slice_48.ctx:0..4000]]}, projection=[record_id, @host], file_type=columnar, output_partitioning=Hash([Column { name: "record_id", index: 0 }], 48), max_parallel_files_per_partition=10
      BufferExec: capacity=_
        AggregateExec: mode=SinglePartitioned, gby=[record_id@0 as record_id, timestamp@1 as timestamp], aggr=[], ordering_mode=Sorted
          ProjectionExec: expr=[record_id@0 as record_id, timestamp@1 as timestamp]
            BrookScanExec: file_groups={48 groups: [[/sample/points/points_01.dat:0..1000], [/sample/points/points_02.dat:0..1000], [/sample/points/points_47.dat:0..1000], [/sample/points/points_48.dat:0..1000]]}, projection=[record_id, timestamp], output_ordering=[record_id@0 ASC, timestamp@1 ASC], output_partitioning=Hash([Column { name: "record_id", index: 0 }], 48)
