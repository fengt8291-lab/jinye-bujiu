import { NormalizedInput, RecoveryScores, RecoveryState } from "./types";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(Math.round(value), min), max);
}

export function calculateScores(input: NormalizedInput, state: RecoveryState): RecoveryScores {
  const sleepDebtScore = clamp(100 - state.metrics.sleepDebtMinutes / 10);
  const circadianScore = clamp(100 - state.metrics.circadianShiftMinutes / 5);
  const cognitiveRiskScore = clamp(
    100 -
      state.severity * 18 -
      Math.max(0, 6 - input.energy) * 5 -
      (input.tomorrowBrainLoad || input.todayImportant ? 12 : 0) -
      (input.mustStayUp ? 14 : 0)
  );
  const recoveryMomentum = clamp(82 - state.severity * 10 - (input.mustStayUp ? 18 : 0) + (input.fixedWakeTime ? 8 : 0));
  const overallRecoveryScore = clamp(
    sleepDebtScore * 0.35 + circadianScore * 0.3 + recoveryMomentum * 0.2 + cognitiveRiskScore * 0.15
  );

  return {
    sleepDebtScore,
    circadianScore,
    cognitiveRiskScore,
    recoveryMomentum,
    overallRecoveryScore,
    momentumLabel: recoveryMomentum >= 72 ? "向上恢复" : recoveryMomentum >= 50 ? "保持稳定" : "需要止损"
  };
}
