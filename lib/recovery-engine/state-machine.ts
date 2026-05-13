import { NormalizedInput, RecoveryLevel, RecoveryStage, RecoveryState, RecoveryTrajectory, StateMetrics } from "./types";

const levels: RecoveryLevel[] = ["正常恢复", "轻度透支", "中度透支", "重度透支"];

function getSeverity(input: NormalizedInput, metrics: StateMetrics) {
  let severity = 0;

  if (input.sleepDurationMinutes < 4 * 60 || metrics.continuousWakeHours >= 20) severity = 3;
  else if (input.sleepDurationMinutes < 5 * 60) severity = 2;
  else if (input.sleepDurationMinutes < 7 * 60) severity = 1;

  if (input.energy <= 4) {
    severity = Math.min(severity + 1, 3);
  }

  const riskHits = [input.mustStayUp, !input.fixedWakeTime, input.tomorrowBrainLoad || input.todayImportant].filter(Boolean).length;
  if (riskHits >= 2) {
    severity = Math.min(severity + 1, 3);
  }

  return severity;
}

function getStage(input: NormalizedInput, metrics: StateMetrics, severity: number): RecoveryStage {
  if (severity >= 3) return "SEVERE_SLEEP_DEBT";
  if (metrics.circadianShiftMinutes >= 2 * 60) return "CIRCADIAN_SHIFT";
  if (severity === 2) return "MODERATE_SLEEP_DEBT";
  if (severity === 1) return "MILD_SLEEP_DEBT";
  if (metrics.sleepDebtMinutes <= 20 && metrics.circadianShiftMinutes <= 45) return "STABLE";
  return "NORMAL";
}

function getTrajectory(input: NormalizedInput, metrics: StateMetrics, stage: RecoveryStage, severity: number): RecoveryTrajectory {
  if (severity >= 3 && (input.mustStayUp || input.tomorrowBrainLoad || input.todayImportant)) return "MIXED";
  if (input.tomorrowBrainLoad || input.todayImportant) return "COGNITIVE_PROTECTION";
  if (metrics.sleepDebtMinutes >= 120) return "DEBT_RECOVERY";
  if (stage === "CIRCADIAN_SHIFT") return "GRADUAL_ADVANCE";
  return "STABILIZE";
}

export function evaluateRecoveryState(input: NormalizedInput, metrics: StateMetrics): RecoveryState {
  const severity = getSeverity(input, metrics);
  const stage = getStage(input, metrics, severity);
  const trajectory = getTrajectory(input, metrics, stage, severity);

  return {
    level: levels[severity],
    stage,
    severity,
    trajectory,
    metrics
  };
}
