-- Source: Apache DataFusion datafusion/sqllogictest/test_files/subquery.slt
EXPLAIN
select (select count(*) from t1) as b, (select count(1) from t2)
;
+---------------+----------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                     |
+---------------+----------------------------------------------------------------------------------------------------------+
| physical_plan | ScalarSubqueryExec: subqueries=2                                                                         |
|               |    ProjectionExec: expr=[scalar_subquery(<pending>) as b, scalar_subquery(<pending>) as count(Int64(1))] |
|               |      PlaceholderRowExec                                                                                  |
|               |    ProjectionExec: expr=[4 as count(*)]                                                                  |
|               |      PlaceholderRowExec                                                                                  |
|               |    ProjectionExec: expr=[4 as count(Int64(1))]                                                           |
|               |      PlaceholderRowExec                                                                                  |
+---------------+----------------------------------------------------------------------------------------------------------+
