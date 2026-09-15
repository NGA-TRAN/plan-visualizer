-- Source: Apache DataFusion datafusion/sqllogictest/test_files/tpch/plans/q3.slt.part
EXPLAIN
select
    l_orderkey,
    sum(l_extendedprice * (1 - l_discount)) as revenue,
    o_orderdate,
    o_shippriority
from
    customer,
    orders,
    lineitem
where
        c_mktsegment = 'BUILDING'
  and c_custkey = o_custkey
  and l_orderkey = o_orderkey
  and o_orderdate < date '1995-03-15'
  and l_shipdate > date '1995-03-15'
group by
    l_orderkey,
    o_orderdate,
    o_shippriority
order by
    revenue desc,
    o_orderdate
limit 10
;
+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                            |
+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| physical_plan | SortPreservingMergeExec: [revenue@1 DESC, o_orderdate@2 ASC NULLS LAST], fetch=10                                                                                                                                                                                                               |
|               |    SortExec: TopK(fetch=10), expr=[revenue@1 DESC, o_orderdate@2 ASC NULLS LAST], preserve_partitioning=[true]                                                                                                                                                                                  |
|               |      ProjectionExec: expr=[l_orderkey@0 as l_orderkey, sum(lineitem.l_extendedprice * Int64(1) - lineitem.l_discount)@3 as revenue, o_orderdate@1 as o_orderdate, o_shippriority@2 as o_shippriority]                                                                                           |
|               |        AggregateExec: mode=SinglePartitioned, gby=[l_orderkey@2 as l_orderkey, o_orderdate@0 as o_orderdate, o_shippriority@1 as o_shippriority], aggr=[sum(lineitem.l_extendedprice * Some(1),20,0 - lineitem.l_discount) as sum(lineitem.l_extendedprice * Int64(1) - lineitem.l_discount)]   |
|               |          HashJoinExec: mode=Partitioned, join_type=Inner, on=[(o_orderkey@0, l_orderkey@0)], projection=[o_orderdate@1, o_shippriority@2, l_orderkey@3, l_extendedprice@4, l_discount@5]                                                                                                        |
|               |            RepartitionExec: partitioning=Hash([o_orderkey@0], 4), input_partitions=4                                                                                                                                                                                                            |
|               |              HashJoinExec: mode=Partitioned, join_type=Inner, on=[(c_custkey@0, o_custkey@1)], projection=[o_orderkey@1, o_orderdate@3, o_shippriority@4]                                                                                                                                       |
|               |                RepartitionExec: partitioning=Hash([c_custkey@0], 4), input_partitions=4                                                                                                                                                                                                         |
|               |                  FilterExec: c_mktsegment@1 = BUILDING, projection=[c_custkey@0]                                                                                                                                                                                                                |
|               |                    RepartitionExec: partitioning=RoundRobinBatch(4), input_partitions=1                                                                                                                                                                                                         |
|               |                      DataSourceExec: file_groups={1 group: [[customer.tbl]]}, projection=[c_custkey, c_mktsegment], file_type=csv, has_header=false                                                                                                                                             |
|               |                RepartitionExec: partitioning=Hash([o_custkey@1], 4), input_partitions=4                                                                                                                                                                                                         |
|               |                  FilterExec: o_orderdate@2 < 1995-03-15                                                                                                                                                                                                                                         |
|               |                    DataSourceExec: file_groups={4 groups: [[orders.tbl:0..4223281], [orders.tbl:4223281..8446562], [orders.tbl:8446562..12669843], [orders.tbl:12669843..16893122]]}, projection=[o_orderkey, o_custkey, o_orderdate, o_shippriority], file_type=csv, has_header=false          |
|               |            RepartitionExec: partitioning=Hash([l_orderkey@0], 4), input_partitions=4                                                                                                                                                                                                            |
|               |              FilterExec: l_shipdate@3 > 1995-03-15, projection=[l_orderkey@0, l_extendedprice@1, l_discount@2]                                                                                                                                                                                  |
|               |                DataSourceExec: file_groups={4 groups: [[lineitem.tbl:0..18561749], [lineitem.tbl:18561749..37123498], [lineitem.tbl:37123498..55685247], [lineitem.tbl:55685247..74246996]]}, projection=[l_orderkey, l_extendedprice, l_discount, l_shipdate], file_type=csv, has_header=false |
+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
