-- Source: Apache DataFusion datafusion/sqllogictest/test_files/cte.slt
EXPLAIN
WITH RECURSIVE trans AS (
    SELECT * FROM closure
    UNION
    SELECT l.start, r.end
    FROM trans as l, closure AS r
    WHERE l.end = r.start
) SELECT * FROM trans
;
+---------------+--------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                     |
+---------------+--------------------------------------------------------------------------------------------------------------------------+
| physical_plan | RecursiveQueryExec: name=trans, is_distinct=true                                                                         |
|               |    DataSourceExec: file_groups={1 group: [[closure.csv]]}, projection=[start, end], file_type=csv, has_header=true       |
|               |    CoalescePartitionsExec                                                                                                |
|               |      HashJoinExec: mode=Partitioned, join_type=Inner, on=[(end@1, start@0)], projection=[start@0, end@3]                 |
|               |        RepartitionExec: partitioning=Hash([end@1], 4), input_partitions=1                                                |
|               |          WorkTableExec: name=trans                                                                                       |
|               |        RepartitionExec: partitioning=Hash([start@0], 4), input_partitions=1                                              |
|               |          DataSourceExec: file_groups={1 group: [[closure.csv]]}, projection=[start, end], file_type=csv, has_header=true |
+---------------+--------------------------------------------------------------------------------------------------------------------------+
