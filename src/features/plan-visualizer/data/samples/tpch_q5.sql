-- Source: Apache DataFusion datafusion/sqllogictest/test_files/tpch/plans/q5.slt.part
EXPLAIN
select
    n_name,
    sum(l_extendedprice * (1 - l_discount)) as revenue
from
    customer,
    orders,
    lineitem,
    supplier,
    nation,
    region
where
        c_custkey = o_custkey
  and l_orderkey = o_orderkey
  and l_suppkey = s_suppkey
  and c_nationkey = s_nationkey
  and s_nationkey = n_nationkey
  and n_regionkey = r_regionkey
  and r_name = 'ASIA'
  and o_orderdate >= date '1994-01-01'
  and o_orderdate < date '1995-01-01'
group by
    n_name
order by
    revenue desc
;
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                                         |
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| physical_plan | SortPreservingMergeExec: [revenue@1 DESC]                                                                                                                                                                                                                                                                    |
|               |    SortExec: expr=[revenue@1 DESC], preserve_partitioning=[true]                                                                                                                                                                                                                                             |
|               |      ProjectionExec: expr=[n_name@0 as n_name, sum(lineitem.l_extendedprice * Int64(1) - lineitem.l_discount)@1 as revenue]                                                                                                                                                                                  |
|               |        AggregateExec: mode=FinalPartitioned, gby=[n_name@0 as n_name], aggr=[sum(lineitem.l_extendedprice * Some(1),20,0 - lineitem.l_discount) as sum(lineitem.l_extendedprice * Int64(1) - lineitem.l_discount)]                                                                                           |
|               |          RepartitionExec: partitioning=Hash([n_name@0], 4), input_partitions=4                                                                                                                                                                                                                               |
|               |            AggregateExec: mode=Partial, gby=[n_name@2 as n_name], aggr=[sum(lineitem.l_extendedprice * Some(1),20,0 - lineitem.l_discount) as sum(lineitem.l_extendedprice * Int64(1) - lineitem.l_discount)]                                                                                                |
|               |              HashJoinExec: mode=Partitioned, join_type=Inner, on=[(n_regionkey@3, r_regionkey@0)], projection=[l_extendedprice@0, l_discount@1, n_name@2]                                                                                                                                                    |
|               |                RepartitionExec: partitioning=Hash([n_regionkey@3], 4), input_partitions=4                                                                                                                                                                                                                    |
|               |                  HashJoinExec: mode=Partitioned, join_type=Inner, on=[(s_nationkey@2, n_nationkey@0)], projection=[l_extendedprice@0, l_discount@1, n_name@4, n_regionkey@5]                                                                                                                                 |
|               |                    RepartitionExec: partitioning=Hash([s_nationkey@2], 4), input_partitions=4                                                                                                                                                                                                                |
|               |                      HashJoinExec: mode=Partitioned, join_type=Inner, on=[(l_suppkey@1, s_suppkey@0), (c_nationkey@0, s_nationkey@1)], projection=[l_extendedprice@2, l_discount@3, s_nationkey@5]                                                                                                           |
|               |                        RepartitionExec: partitioning=Hash([l_suppkey@1, c_nationkey@0], 4), input_partitions=4                                                                                                                                                                                               |
|               |                          HashJoinExec: mode=Partitioned, join_type=Inner, on=[(o_orderkey@1, l_orderkey@0)], projection=[c_nationkey@0, l_suppkey@3, l_extendedprice@4, l_discount@5]                                                                                                                        |
|               |                            RepartitionExec: partitioning=Hash([o_orderkey@1], 4), input_partitions=4                                                                                                                                                                                                         |
|               |                              HashJoinExec: mode=Partitioned, join_type=Inner, on=[(c_custkey@0, o_custkey@1)], projection=[c_nationkey@1, o_orderkey@2]                                                                                                                                                      |
|               |                                RepartitionExec: partitioning=Hash([c_custkey@0], 4), input_partitions=1                                                                                                                                                                                                      |
|               |                                  DataSourceExec: file_groups={1 group: [[customer.tbl]]}, projection=[c_custkey, c_nationkey], file_type=csv, has_header=false                                                                                                                                               |
|               |                                RepartitionExec: partitioning=Hash([o_custkey@1], 4), input_partitions=4                                                                                                                                                                                                      |
|               |                                  FilterExec: o_orderdate@2 >= 1994-01-01 AND o_orderdate@2 < 1995-01-01, projection=[o_orderkey@0, o_custkey@1]                                                                                                                                                              |
|               |                                    DataSourceExec: file_groups={4 groups: [[orders.tbl:0..4223281], [orders.tbl:4223281..8446562], [orders.tbl:8446562..12669843], [orders.tbl:12669843..16893122]]}, projection=[o_orderkey, o_custkey, o_orderdate], file_type=csv, has_header=false                       |
|               |                            RepartitionExec: partitioning=Hash([l_orderkey@0], 4), input_partitions=4                                                                                                                                                                                                         |
|               |                              DataSourceExec: file_groups={4 groups: [[lineitem.tbl:0..18561749], [lineitem.tbl:18561749..37123498], [lineitem.tbl:37123498..55685247], [lineitem.tbl:55685247..74246996]]}, projection=[l_orderkey, l_suppkey, l_extendedprice, l_discount], file_type=csv, has_header=false |
|               |                        RepartitionExec: partitioning=Hash([s_suppkey@0, s_nationkey@1], 4), input_partitions=1                                                                                                                                                                                               |
|               |                          DataSourceExec: file_groups={1 group: [[supplier.tbl]]}, projection=[s_suppkey, s_nationkey], file_type=csv, has_header=false                                                                                                                                                       |
|               |                    RepartitionExec: partitioning=Hash([n_nationkey@0], 4), input_partitions=1                                                                                                                                                                                                                |
|               |                      DataSourceExec: file_groups={1 group: [[nation.tbl]]}, projection=[n_nationkey, n_name, n_regionkey], file_type=csv, has_header=false                                                                                                                                                   |
|               |                RepartitionExec: partitioning=Hash([r_regionkey@0], 4), input_partitions=4                                                                                                                                                                                                                    |
|               |                  FilterExec: r_name@1 = ASIA, projection=[r_regionkey@0]                                                                                                                                                                                                                                     |
|               |                    RepartitionExec: partitioning=RoundRobinBatch(4), input_partitions=1                                                                                                                                                                                                                      |
|               |                      DataSourceExec: file_groups={1 group: [[region.tbl]]}, projection=[r_regionkey, r_name], file_type=csv, has_header=false                                                                                                                                                                |
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
