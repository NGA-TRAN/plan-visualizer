-- Source: Apache DataFusion datafusion/sqllogictest/test_files/tpch/plans/q11.slt.part
EXPLAIN
select
    ps_partkey,
    sum(ps_supplycost * ps_availqty) as value
from
    partsupp,
    supplier,
    nation
where
    ps_suppkey = s_suppkey
  and s_nationkey = n_nationkey
  and n_name = 'GERMANY'
group by
    ps_partkey having
    sum(ps_supplycost * ps_availqty) > (
    select
    sum(ps_supplycost * ps_availqty) * 0.0001
    from
    partsupp,
    supplier,
    nation
    where
    ps_suppkey = s_suppkey
                  and s_nationkey = n_nationkey
                  and n_name = 'GERMANY'
    )
order by
    value desc
limit 10
;
+---------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                               |
+---------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| physical_plan | ScalarSubqueryExec: subqueries=1                                                                                                                                                                                                                                                                   |
|               |    SortPreservingMergeExec: [value@1 DESC], fetch=10                                                                                                                                                                                                                                               |
|               |      SortExec: TopK(fetch=10), expr=[value@1 DESC], preserve_partitioning=[true]                                                                                                                                                                                                                   |
|               |        ProjectionExec: expr=[ps_partkey@0 as ps_partkey, sum(partsupp.ps_supplycost * partsupp.ps_availqty)@1 as value]                                                                                                                                                                            |
|               |          FilterExec: CAST(sum(partsupp.ps_supplycost * partsupp.ps_availqty)@1 AS Decimal128(38, 15)) > scalar_subquery(<pending>)                                                                                                                                                                 |
|               |            AggregateExec: mode=FinalPartitioned, gby=[ps_partkey@0 as ps_partkey], aggr=[sum(partsupp.ps_supplycost * partsupp.ps_availqty)]                                                                                                                                                       |
|               |              RepartitionExec: partitioning=Hash([ps_partkey@0], 4), input_partitions=4                                                                                                                                                                                                             |
|               |                AggregateExec: mode=Partial, gby=[ps_partkey@0 as ps_partkey], aggr=[sum(partsupp.ps_supplycost * partsupp.ps_availqty)]                                                                                                                                                            |
|               |                  HashJoinExec: mode=Partitioned, join_type=Inner, on=[(s_nationkey@3, n_nationkey@0)], projection=[ps_partkey@0, ps_availqty@1, ps_supplycost@2]                                                                                                                                   |
|               |                    RepartitionExec: partitioning=Hash([s_nationkey@3], 4), input_partitions=4                                                                                                                                                                                                      |
|               |                      HashJoinExec: mode=Partitioned, join_type=Inner, on=[(ps_suppkey@1, s_suppkey@0)], projection=[ps_partkey@0, ps_availqty@2, ps_supplycost@3, s_nationkey@5]                                                                                                                   |
|               |                        RepartitionExec: partitioning=Hash([ps_suppkey@1], 4), input_partitions=4                                                                                                                                                                                                   |
|               |                          DataSourceExec: file_groups={4 groups: [[partsupp.tbl:0..2932049], [partsupp.tbl:2932049..5864098], [partsupp.tbl:5864098..8796147], [partsupp.tbl:8796147..11728193]]}, projection=[ps_partkey, ps_suppkey, ps_availqty, ps_supplycost], file_type=csv, has_header=false |
|               |                        RepartitionExec: partitioning=Hash([s_suppkey@0], 4), input_partitions=1                                                                                                                                                                                                    |
|               |                          DataSourceExec: file_groups={1 group: [[supplier.tbl]]}, projection=[s_suppkey, s_nationkey], file_type=csv, has_header=false                                                                                                                                             |
|               |                    RepartitionExec: partitioning=Hash([n_nationkey@0], 4), input_partitions=4                                                                                                                                                                                                      |
|               |                      FilterExec: n_name@1 = GERMANY, projection=[n_nationkey@0]                                                                                                                                                                                                                    |
|               |                        RepartitionExec: partitioning=RoundRobinBatch(4), input_partitions=1                                                                                                                                                                                                        |
|               |                          DataSourceExec: file_groups={1 group: [[nation.tbl]]}, projection=[n_nationkey, n_name], file_type=csv, has_header=false                                                                                                                                                  |
|               |    ProjectionExec: expr=[CAST(CAST(sum(partsupp.ps_supplycost * partsupp.ps_availqty)@0 AS Float64) * 0.0001 AS Decimal128(38, 15)) as sum(partsupp.ps_supplycost * partsupp.ps_availqty) * Float64(0.0001)]                                                                                       |
|               |      AggregateExec: mode=Final, gby=[], aggr=[sum(partsupp.ps_supplycost * partsupp.ps_availqty)]                                                                                                                                                                                                  |
|               |        CoalescePartitionsExec                                                                                                                                                                                                                                                                      |
|               |          AggregateExec: mode=Partial, gby=[], aggr=[sum(partsupp.ps_supplycost * partsupp.ps_availqty)]                                                                                                                                                                                            |
|               |            HashJoinExec: mode=Partitioned, join_type=Inner, on=[(s_nationkey@2, n_nationkey@0)], projection=[ps_availqty@0, ps_supplycost@1]                                                                                                                                                       |
|               |              RepartitionExec: partitioning=Hash([s_nationkey@2], 4), input_partitions=4                                                                                                                                                                                                            |
|               |                HashJoinExec: mode=Partitioned, join_type=Inner, on=[(ps_suppkey@0, s_suppkey@0)], projection=[ps_availqty@1, ps_supplycost@2, s_nationkey@4]                                                                                                                                       |
|               |                  RepartitionExec: partitioning=Hash([ps_suppkey@0], 4), input_partitions=4                                                                                                                                                                                                         |
|               |                    DataSourceExec: file_groups={4 groups: [[partsupp.tbl:0..2932049], [partsupp.tbl:2932049..5864098], [partsupp.tbl:5864098..8796147], [partsupp.tbl:8796147..11728193]]}, projection=[ps_suppkey, ps_availqty, ps_supplycost], file_type=csv, has_header=false                   |
|               |                  RepartitionExec: partitioning=Hash([s_suppkey@0], 4), input_partitions=1                                                                                                                                                                                                          |
|               |                    DataSourceExec: file_groups={1 group: [[supplier.tbl]]}, projection=[s_suppkey, s_nationkey], file_type=csv, has_header=false                                                                                                                                                   |
|               |              RepartitionExec: partitioning=Hash([n_nationkey@0], 4), input_partitions=4                                                                                                                                                                                                            |
|               |                FilterExec: n_name@1 = GERMANY, projection=[n_nationkey@0]                                                                                                                                                                                                                          |
|               |                  RepartitionExec: partitioning=RoundRobinBatch(4), input_partitions=1                                                                                                                                                                                                              |
|               |                    DataSourceExec: file_groups={1 group: [[nation.tbl]]}, projection=[n_nationkey, n_name], file_type=csv, has_header=false                                                                                                                                                        |
+---------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
