-- Source: Apache DataFusion datafusion/sqllogictest/test_files/tpch/plans/q21.slt.part
EXPLAIN
select
    s_name,
    count(*) as numwait
from
    supplier,
    lineitem l1,
    orders,
    nation
where
        s_suppkey = l1.l_suppkey
  and o_orderkey = l1.l_orderkey
  and o_orderstatus = 'F'
  and l1.l_receiptdate > l1.l_commitdate
  and exists (
        select
            *
        from
            lineitem l2
        where
                l2.l_orderkey = l1.l_orderkey
          and l2.l_suppkey <> l1.l_suppkey
    )
  and not exists (
        select
            *
        from
            lineitem l3
        where
                l3.l_orderkey = l1.l_orderkey
          and l3.l_suppkey <> l1.l_suppkey
          and l3.l_receiptdate > l3.l_commitdate
    )
  and s_nationkey = n_nationkey
  and n_name = 'SAUDI ARABIA'
group by
    s_name
order by
    numwait desc,
    s_name
;
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                                             |
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| physical_plan | SortPreservingMergeExec: [numwait@1 DESC, s_name@0 ASC NULLS LAST]                                                                                                                                                                                                                                               |
|               |    SortExec: expr=[numwait@1 DESC, s_name@0 ASC NULLS LAST], preserve_partitioning=[true]                                                                                                                                                                                                                        |
|               |      ProjectionExec: expr=[s_name@0 as s_name, count(Int64(1))@1 as numwait]                                                                                                                                                                                                                                     |
|               |        AggregateExec: mode=FinalPartitioned, gby=[s_name@0 as s_name], aggr=[count(Int64(1))]                                                                                                                                                                                                                    |
|               |          RepartitionExec: partitioning=Hash([s_name@0], 4), input_partitions=4                                                                                                                                                                                                                                   |
|               |            AggregateExec: mode=Partial, gby=[s_name@0 as s_name], aggr=[count(Int64(1))]                                                                                                                                                                                                                         |
|               |              HashJoinExec: mode=Partitioned, join_type=LeftAnti, on=[(l_orderkey@1, l_orderkey@0)], filter=l_suppkey@1 != l_suppkey@0, projection=[s_name@0]                                                                                                                                                     |
|               |                HashJoinExec: mode=Partitioned, join_type=LeftSemi, on=[(l_orderkey@1, l_orderkey@0)], filter=l_suppkey@1 != l_suppkey@0                                                                                                                                                                          |
|               |                  RepartitionExec: partitioning=Hash([l_orderkey@1], 4), input_partitions=4                                                                                                                                                                                                                       |
|               |                    HashJoinExec: mode=Partitioned, join_type=Inner, on=[(s_nationkey@1, n_nationkey@0)], projection=[s_name@0, l_orderkey@2, l_suppkey@3]                                                                                                                                                        |
|               |                      RepartitionExec: partitioning=Hash([s_nationkey@1], 4), input_partitions=4                                                                                                                                                                                                                  |
|               |                        HashJoinExec: mode=Partitioned, join_type=Inner, on=[(l_orderkey@2, o_orderkey@0)], projection=[s_name@0, s_nationkey@1, l_orderkey@2, l_suppkey@3]                                                                                                                                       |
|               |                          RepartitionExec: partitioning=Hash([l_orderkey@2], 4), input_partitions=4                                                                                                                                                                                                               |
|               |                            HashJoinExec: mode=Partitioned, join_type=Inner, on=[(s_suppkey@0, l_suppkey@1)], projection=[s_name@1, s_nationkey@2, l_orderkey@3, l_suppkey@4]                                                                                                                                     |
|               |                              RepartitionExec: partitioning=Hash([s_suppkey@0], 4), input_partitions=1                                                                                                                                                                                                            |
|               |                                DataSourceExec: file_groups={1 group: [[supplier.tbl]]}, projection=[s_suppkey, s_name, s_nationkey], file_type=csv, has_header=false                                                                                                                                             |
|               |                              RepartitionExec: partitioning=Hash([l_suppkey@1], 4), input_partitions=4                                                                                                                                                                                                            |
|               |                                FilterExec: l_receiptdate@3 > l_commitdate@2, projection=[l_orderkey@0, l_suppkey@1]                                                                                                                                                                                              |
|               |                                  DataSourceExec: file_groups={4 groups: [[lineitem.tbl:0..18561749], [lineitem.tbl:18561749..37123498], [lineitem.tbl:37123498..55685247], [lineitem.tbl:55685247..74246996]]}, projection=[l_orderkey, l_suppkey, l_commitdate, l_receiptdate], file_type=csv, has_header=false |
|               |                          RepartitionExec: partitioning=Hash([o_orderkey@0], 4), input_partitions=4                                                                                                                                                                                                               |
|               |                            FilterExec: o_orderstatus@1 = F, projection=[o_orderkey@0]                                                                                                                                                                                                                            |
|               |                              DataSourceExec: file_groups={4 groups: [[orders.tbl:0..4223281], [orders.tbl:4223281..8446562], [orders.tbl:8446562..12669843], [orders.tbl:12669843..16893122]]}, projection=[o_orderkey, o_orderstatus], file_type=csv, has_header=false                                          |
|               |                      RepartitionExec: partitioning=Hash([n_nationkey@0], 4), input_partitions=4                                                                                                                                                                                                                  |
|               |                        FilterExec: n_name@1 = SAUDI ARABIA, projection=[n_nationkey@0]                                                                                                                                                                                                                           |
|               |                          RepartitionExec: partitioning=RoundRobinBatch(4), input_partitions=1                                                                                                                                                                                                                    |
|               |                            DataSourceExec: file_groups={1 group: [[nation.tbl]]}, projection=[n_nationkey, n_name], file_type=csv, has_header=false                                                                                                                                                              |
|               |                  RepartitionExec: partitioning=Hash([l_orderkey@0], 4), input_partitions=4                                                                                                                                                                                                                       |
|               |                    DataSourceExec: file_groups={4 groups: [[lineitem.tbl:0..18561749], [lineitem.tbl:18561749..37123498], [lineitem.tbl:37123498..55685247], [lineitem.tbl:55685247..74246996]]}, projection=[l_orderkey, l_suppkey], file_type=csv, has_header=false                                            |
|               |                RepartitionExec: partitioning=Hash([l_orderkey@0], 4), input_partitions=4                                                                                                                                                                                                                         |
|               |                  FilterExec: l_receiptdate@3 > l_commitdate@2, projection=[l_orderkey@0, l_suppkey@1]                                                                                                                                                                                                            |
|               |                    DataSourceExec: file_groups={4 groups: [[lineitem.tbl:0..18561749], [lineitem.tbl:18561749..37123498], [lineitem.tbl:37123498..55685247], [lineitem.tbl:55685247..74246996]]}, projection=[l_orderkey, l_suppkey, l_commitdate, l_receiptdate], file_type=csv, has_header=false               |
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
