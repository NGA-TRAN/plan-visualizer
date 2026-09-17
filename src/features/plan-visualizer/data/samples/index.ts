// Sample execution plans shown in the Load a sample menu.
// TPC-H / CTE / subquery / union / join_aggregates fixtures come from plan-viz tests:
// https://github.com/NGA-TRAN/plan_viz/tree/master/tests

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

export type SampleGroup = "Starter" | "TPC-H" | "Other";

export interface SamplePlan {
  id: string;
  label: string;
  group: SampleGroup;
  plan: string;
}

export const SAMPLE_GROUPS: SampleGroup[] = ["Starter", "TPC-H", "Other"];

export const SAMPLE_PLANS: SamplePlan[] = [
  {
    id: "simple-filter",
    label: "Simple Filter",
    group: "Starter",
    plan: simpleFilter,
  },
  { id: "hash-join", label: "Hash Join", group: "Starter", plan: hashJoin },
  {
    id: "join-aggregates",
    label: "Join + Aggregates",
    group: "Starter",
    plan: joinAggregates,
  },
  {
    id: "tpch-q3",
    label: "TPC-H Q3 — Shipping Priority",
    group: "TPC-H",
    plan: tpchQ3,
  },
  {
    id: "tpch-q5",
    label: "TPC-H Q5 — Local Supplier Volume",
    group: "TPC-H",
    plan: tpchQ5,
  },
  {
    id: "tpch-q11",
    label: "TPC-H Q11 — Important Stock",
    group: "TPC-H",
    plan: tpchQ11,
  },
  {
    id: "tpch-q21",
    label: "TPC-H Q21 — Waiting Orders",
    group: "TPC-H",
    plan: tpchQ21,
  },
  {
    id: "recursive-cte",
    label: "Recursive CTE",
    group: "Other",
    plan: recursiveCte,
  },
  {
    id: "two-scalar-subqueries",
    label: "Two Scalar Subqueries",
    group: "Other",
    plan: twoScalarSubqueries,
  },
  { id: "union-join", label: "Union + Join", group: "Other", plan: unionJoin },
];

export function getSamplePlan(id: string): SamplePlan | undefined {
  return SAMPLE_PLANS.find((sample) => sample.id === id);
}
