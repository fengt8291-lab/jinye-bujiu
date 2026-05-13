import { normalizeInput } from "./input-parser";
import { evaluateStateMetrics } from "./state-evaluator";
import { evaluateRecoveryState } from "./state-machine";
import { evaluateRules } from "./rule-engine";
import { resolveConflicts } from "./conflict-resolver";
import { calculateScores } from "./scoring";
import { buildMultiDayPlan } from "./plan-generator";
import { stageCopy } from "./copy";
import { RecoveryEngineInput, RecoveryPlan } from "./types";

export * from "./types";
export { stageCopy, trajectoryLabel } from "./copy";

function getSleepDebtText(minutes: number) {
  const hours = Math.round((minutes / 60) * 10) / 10;

  if (minutes <= 20) return "轻微或无睡眠债";
  if (minutes < 120) return `约 ${hours}h 睡眠债`;
  return `约 ${hours}h 睡眠债，今天不要追回所有进度`;
}

function getRiskText(input: RecoveryEngineInput, score: number, cognitiveRisk: string) {
  if (input.mustStayUp) return "二次透支风险高";
  if (cognitiveRisk === "CRITICAL") return "高风险操作需暂停";
  if (cognitiveRisk === "HIGH") return "白天崩盘风险偏高";
  if (score < 60) return "恢复不稳定";
  return "风险可控";
}

export function buildRecoveryPlan(rawInput: RecoveryEngineInput): RecoveryPlan {
  const input = normalizeInput(rawInput);
  const metrics = evaluateStateMetrics(input);
  const state = evaluateRecoveryState(input, metrics);
  const rules = evaluateRules(input, state);
  const resolved = resolveConflicts(input, state, rules);
  const scores = calculateScores(input, state);
  const copy = stageCopy[state.stage];
  const timeline = buildMultiDayPlan(input, state, resolved, rules);

  return {
    level: state.level,
    stage: state.stage,
    stageLabel: copy.label,
    stageBrief: copy.brief,
    trajectory: state.trajectory,
    score: scores.overallRecoveryScore,
    scores,
    sleepHours: input.sleepHours,
    sleepDebt: getSleepDebtText(metrics.sleepDebtMinutes),
    risk: getRiskText(rawInput, scores.overallRecoveryScore, metrics.cognitiveRisk),
    targetLine: copy.brief,
    rules,
    timeline
  };
}
