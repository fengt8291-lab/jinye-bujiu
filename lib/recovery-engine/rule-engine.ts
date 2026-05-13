import { NormalizedInput, RecoveryState, TriggeredRule } from "./types";
import { recoveryRules } from "./rules";

type FactMap = Record<string, boolean>;

function buildFacts(input: NormalizedInput, state: RecoveryState): FactMap {
  return {
    severeDebt: state.severity >= 3,
    sleepDebtModerate: state.severity >= 2,
    sleepPressureHigh: state.metrics.sleepPressureLevel === "HIGH" || state.metrics.sleepPressureLevel === "CRITICAL",
    continuousWakeCritical: state.metrics.continuousWakeHours >= 18,
    circadianShiftHigh: state.metrics.circadianShiftMinutes >= 2 * 60,
    lateSleep: input.sleepStartMinutes >= 24 * 60 + 30,
    napAvailable: input.canNapToday || input.canNapTomorrow,
    cognitiveDemandHigh: input.tomorrowBrainLoad || input.todayImportant,
    fixedWakeTime: input.fixedWakeTime,
    earlyClass: input.tomorrowEarlyClass
  };
}

function matchesCondition(facts: FactMap, all?: string[], any?: string[]) {
  const allPass = !all || all.every((fact) => facts[fact]);
  const anyPass = !any || any.some((fact) => facts[fact]);
  return allPass && anyPass;
}

const priorityWeight = {
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4
};

export function evaluateRules(input: NormalizedInput, state: RecoveryState): TriggeredRule[] {
  const facts = buildFacts(input, state);

  return recoveryRules
    .filter((rule) => matchesCondition(facts, rule.condition.all, rule.condition.any))
    .map((rule) => ({
      ...rule,
      reason: rule.condition.all?.concat(rule.condition.any || []).filter((fact) => facts[fact]).join(", ") || "default"
    }))
    .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
}
