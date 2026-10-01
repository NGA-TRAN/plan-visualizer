// Sample execution plans grouped by kind.
// TPC-H / CTE / subquery / union / join_aggregates fixtures come from plan-viz tests:
// https://github.com/NGA-TRAN/plan_viz/tree/master/tests
// Custom/distributed fixtures are copied unchanged from plan-viz 0.1.25:
// https://github.com/NGA-TRAN/plan_viz/tree/88e902a9336a7853b3f934478697eed440dcc845/tests

import simpleFilter from "./simple-filter.sql?raw";
import hashJoin from "./hash-join.sql?raw";
import tpchQ3 from "./tpch_q3.sql?raw";
import tpchQ5 from "./tpch_q5.sql?raw";
import tpchQ11 from "./tpch_q11.sql?raw";
import tpchQ21 from "./tpch_q21.sql?raw";
import recursiveCte from "./recursive_cte_trans.sql?raw";
import twoScalarSubqueries from "./subquery_two_scalars.sql?raw";
import unionJoin from "./union_join.sql?raw";
import joinAggregates from "./join_aggregates.sql?raw";

import customWrappedJoin from "./custom/inferred_collect_left.sql?raw";
import customPartitionedJoin from "./custom/inferred_partitioned.sql?raw";
import customUnknownOperators from "./custom/inferred_generic.sql?raw";
import distributedCountDistinctUnion from "./distributed/count_distinct_union_time_ranges.sql?raw";
import distributedJoinAggregate from "./distributed/join_aggregate_six_to_four.sql?raw";
import distributedPartialReduce from "./distributed/shuffle_partial_reduce.sql?raw";
import distributedDynamicFilter from "./distributed/dynamic_filter_range_join.sql?raw";
import distributedFullOuterJoin from "./distributed/full_outer_join_two_shuffles.sql?raw";
import distributedUnionMetrics from "./distributed/union_five_branches_metrics.sql?raw";

export const SAMPLE_CATEGORIES = [
  { id: "single-node", label: "Single-node plans" },
  { id: "custom", label: "Custom plans" },
  { id: "distributed", label: "Distributed plans", status: "alpha" },
] as const;

export type SampleCategory = (typeof SAMPLE_CATEGORIES)[number]["id"];

export type SampleGroup = "Starter" | "TPC-H" | "Other";

export interface SamplePlan {
  id: string;
  label: string;
  category: SampleCategory;
  group?: SampleGroup;
  plan: string;
}

export const SAMPLE_PLANS: SamplePlan[] = [
  {
    id: "simple-filter",
    label: "Simple Filter",
    category: "single-node",
    group: "Starter",
    plan: simpleFilter,
  },
  {
    id: "hash-join",
    label: "Hash Join",
    category: "single-node",
    group: "Starter",
    plan: hashJoin,
  },
  {
    id: "join-aggregates",
    label: "Join + Aggregates",
    category: "single-node",
    group: "Starter",
    plan: joinAggregates,
  },
  {
    id: "tpch-q3",
    label: "TPC-H Q3 — Shipping Priority",
    category: "single-node",
    group: "TPC-H",
    plan: tpchQ3,
  },
  {
    id: "tpch-q5",
    label: "TPC-H Q5 — Local Supplier Volume",
    category: "single-node",
    group: "TPC-H",
    plan: tpchQ5,
  },
  {
    id: "tpch-q11",
    label: "TPC-H Q11 — Important Stock",
    category: "single-node",
    group: "TPC-H",
    plan: tpchQ11,
  },
  {
    id: "tpch-q21",
    label: "TPC-H Q21 — Waiting Orders",
    category: "single-node",
    group: "TPC-H",
    plan: tpchQ21,
  },
  {
    id: "recursive-cte",
    label: "Recursive CTE",
    category: "single-node",
    group: "Other",
    plan: recursiveCte,
  },
  {
    id: "two-scalar-subqueries",
    label: "Two Scalar Subqueries",
    category: "single-node",
    group: "Other",
    plan: twoScalarSubqueries,
  },
  {
    id: "union-join",
    label: "Union + Join",
    category: "single-node",
    group: "Other",
    plan: unionJoin,
  },
  {
    id: "custom-wrapped-join",
    label: "Wrapped join + custom scans",
    category: "custom",
    plan: customWrappedJoin,
  },
  {
    id: "custom-partitioned-join",
    label: "Partitioned custom join",
    category: "custom",
    plan: customPartitionedJoin,
  },
  {
    id: "custom-unknown-operators",
    label: "Unknown operators",
    category: "custom",
    plan: customUnknownOperators,
  },
  {
    id: "distributed-count-distinct-union-time-ranges",
    label: "Count distinct · union time ranges",
    category: "distributed",
    plan: distributedCountDistinctUnion,
  },
  {
    id: "distributed-join-aggregate-six-to-four",
    label: "Join + aggregate · 6 → 4 tasks",
    category: "distributed",
    plan: distributedJoinAggregate,
  },
  {
    id: "distributed-shuffle-partial-reduce",
    label: "Shuffle + partial reduce",
    category: "distributed",
    plan: distributedPartialReduce,
  },
  {
    id: "distributed-dynamic-filter-range-join",
    label: "Dynamic filter range join",
    category: "distributed",
    plan: distributedDynamicFilter,
  },
  {
    id: "distributed-full-outer-join-two-shuffles",
    label: "Full outer join · two shuffles",
    category: "distributed",
    plan: distributedFullOuterJoin,
  },
  {
    id: "distributed-union-five-branches-metrics",
    label: "Union · 5 branches + metrics",
    category: "distributed",
    plan: distributedUnionMetrics,
  },
];

export function getSamplePlan(id: string): SamplePlan | undefined {
  return SAMPLE_PLANS.find((sample) => sample.id === id);
}
