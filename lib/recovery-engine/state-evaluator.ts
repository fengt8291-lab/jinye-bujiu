import { toSleepCoordinate, toWakeCoordinate } from "./input-parser";
import { NormalizedInput, StateMetrics } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function evaluateStateMetrics(input: NormalizedInput): StateMetrics {
  const recommendedSleepMinutes = 7.5 * 60;
  const sleepDebtMinutes = Math.max(0, recommendedSleepMinutes - input.sleepDurationMinutes);
  const continuousWakeHours = Math.round(((toSleepCoordinate(input.sleepStart) - toWakeCoordinate(input.wakeTime) + 24 * 60) / 60) * 10) / 10;
  const currentSleepMidpoint = input.sleepStartMinutes + input.sleepDurationMinutes / 2;
  const baselineMidpoint = input.requiredWakeMinutes - recommendedSleepMinutes / 2;
  const circadianShiftMinutes = clamp(currentSleepMidpoint - baselineMidpoint, 0, 8 * 60);

  const sleepPressureLevel =
    input.sleepDurationMinutes < 4 * 60 || continuousWakeHours >= 20
      ? "CRITICAL"
      : input.sleepDurationMinutes < 5.5 * 60
        ? "HIGH"
        : input.sleepDurationMinutes < 7 * 60
          ? "MODERATE"
          : "LOW";

  const cognitiveRisk =
    sleepPressureLevel === "CRITICAL" || input.energy <= 3
      ? "CRITICAL"
      : sleepPressureLevel === "HIGH" || input.tomorrowBrainLoad || input.todayImportant
        ? "HIGH"
        : sleepPressureLevel === "MODERATE"
          ? "MODERATE"
          : "LOW";

  return {
    sleepDebtMinutes,
    continuousWakeHours,
    currentSleepMidpoint,
    baselineMidpoint,
    circadianShiftMinutes,
    sleepPressureLevel,
    cognitiveRisk
  };
}
