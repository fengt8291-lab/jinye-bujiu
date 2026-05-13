import { NormalizedInput, RecoveryState, TriggeredRule } from "./types";

export type ResolvedConstraints = {
  wakeAnchor: string;
  bedtimeAdvanceStep: number;
  latestCaffeineDayOne: string;
  napDuration: number;
  warnings: string[];
};

export function resolveConflicts(input: NormalizedInput, state: RecoveryState, rules: TriggeredRule[]): ResolvedConstraints {
  const warnings: string[] = [];
  const hasSafetyWarning = rules.some((rule) => rule.id === "R_SAFETY_WARNING");

  if (hasSafetyWarning) {
    warnings.push("今天避免驾驶和高风险操作，把必要任务压到最低。");
  }

  if (input.mustStayUp) {
    warnings.push("最近几天仍要熬夜，计划会优先止损，不强行早睡。");
  }

  if (input.dormPowerOff) {
    warnings.push(`宿舍 ${input.dormPowerOff.start}-${input.dormPowerOff.end} 有限制，提前完成洗漱和收尾。`);
  }

  return {
    wakeAnchor: input.requiredWakeTime,
    bedtimeAdvanceStep: state.severity >= 3 || state.metrics.circadianShiftMinutes >= 2 * 60 ? 30 : 20,
    latestCaffeineDayOne: state.severity >= 3 ? "12:30" : input.tomorrowBrainLoad || input.todayImportant ? "13:00" : "14:00",
    napDuration: state.severity >= 3 ? 25 : 20,
    warnings
  };
}
