import { formatTime, toSleepCoordinate } from "./input-parser";
import { stageCopy } from "./copy";
import { ResolvedConstraints } from "./conflict-resolver";
import { DailyRecoveryPlan, NormalizedInput, RecoveryState, TriggeredRule } from "./types";

function getPlanLength(state: RecoveryState, input: NormalizedInput) {
  if (state.trajectory === "MIXED" || state.severity >= 3 || input.mustStayUp) return 5;
  return 4;
}

function getWakeTime(day: number, input: NormalizedInput) {
  if (input.fixedWakeTime || input.tomorrowEarlyClass || input.todayImportant) {
    return input.requiredWakeTime;
  }

  return formatTime(input.requiredWakeMinutes - Math.max(0, day - 1) * 20);
}

function getBedtime(day: number, input: NormalizedInput, state: RecoveryState, resolved: ResolvedConstraints) {
  const targetSleepMinutes = state.severity >= 3 ? 8 * 60 : state.severity >= 2 ? 7.5 * 60 : 7 * 60;
  const wakeBased = input.requiredWakeMinutes - targetSleepMinutes;
  const driftBased = toSleepCoordinate(input.sleepStart) - Math.min(day * resolved.bedtimeAdvanceStep, 180);
  let bedtime = Math.max(wakeBased, driftBased);
  const stayUpFloor =
    input.mustStayUp && input.mustStayUpUntil && day === 1 ? toSleepCoordinate(input.mustStayUpUntil) : null;

  if (stayUpFloor !== null && state.severity >= 3) {
    bedtime = Math.max(wakeBased, stayUpFloor);
  } else if (stayUpFloor !== null) {
    bedtime = Math.max(bedtime, stayUpFloor);
  }

  if (input.dormPowerOff) {
    const dormPrepTime = toSleepCoordinate(input.dormPowerOff.start) - 20;

    if (stayUpFloor === null || dormPrepTime >= stayUpFloor) {
      bedtime = Math.min(bedtime, dormPrepTime);
    }
  }

  return formatTime(bedtime);
}

function getNap(day: number, input: NormalizedInput, state: RecoveryState, resolved: ResolvedConstraints) {
  const canNap = day === 1 ? input.canNapToday : input.canNapTomorrow;

  if (!canNap) return `${input.napWindow.start} 前后闭眼 8 分钟，不安排正式午睡`;
  if (day > 2 && state.severity < 3) return "不再安排午睡，让晚上更容易睡着";
  if (day > 2) return "不再安排午睡，避免晚上继续拖后";

  return `${input.napWindow.start}-${input.napWindow.end} 之间睡 ${resolved.napDuration} 分钟`;
}

function getCaffeine(day: number, state: RecoveryState, resolved: ResolvedConstraints) {
  if (day === 1) return `仅 ${state.severity >= 3 ? "09:00" : "09:30"}-${resolved.latestCaffeineDayOne}，之后停止`;
  if (day === 2) return "09:00-12:00，减到半杯或不喝";
  return "不主动安排咖啡因";
}

function getExercise(day: number, input: NormalizedInput, state: RecoveryState) {
  if (!input.canExercise) return "不安排运动，晚饭后慢走 8 分钟就够";
  if (state.severity >= 3) return day <= 2 ? "只轻走 10 分钟，不做强度训练" : `${input.exerciseWindow.start} 后轻拉伸 10 分钟`;
  if (state.severity >= 2) return day <= 2 ? `${input.exerciseWindow.start} 后慢走或拉伸 10-15 分钟` : "恢复到中低强度活动";
  return `${input.exerciseWindow.start} 后轻快走 15-20 分钟`;
}

function getHeadline(day: number, state: RecoveryState) {
  if (day === 1) return stageCopy[state.stage].label;
  if (day === 2) return "开始把作息拉回来";
  if (day === 3) return "减少白天补偿";
  return "稳住固定节奏";
}

function getGoal(day: number, state: RecoveryState, input: NormalizedInput) {
  if (day === 1 && (state.severity >= 3 || input.mustStayUp)) return "今天先别追回进度，停止继续透支";
  if (day === 1) return "先把今天的能量边界稳住";
  if (day === 2) return "减少咖啡和补觉，让晚上更容易睡着";
  if (day === 3) return "固定起床点，降低作息后移";
  return "保持稳定，不再让昨天影响明天";
}

export function buildMultiDayPlan(
  input: NormalizedInput,
  state: RecoveryState,
  resolved: ResolvedConstraints,
  rules: TriggeredRule[]
): DailyRecoveryPlan[] {
  const length = getPlanLength(state, input);

  return Array.from({ length }, (_, index) => {
    const day = index + 1;
    const wakeTime = getWakeTime(day, input);
    const bedtime = getBedtime(day, input, state, resolved);
    const nap = getNap(day, input, state, resolved);
    const caffeine = getCaffeine(day, state, resolved);
    const exercise = getExercise(day, input, state);
    const warnings = day === 1 ? resolved.warnings : [];
    const napAnchorLabel = nap.startsWith("不再") || nap.includes("闭眼") ? "闭眼" : "短睡";

    return {
      day,
      headline: getHeadline(day, state),
      wakeTime,
      bedtime,
      nap,
      caffeine,
      tea: day <= 2 ? "只喝淡茶，16:00 后不喝浓茶" : "晚间不喝茶，给入睡留空间",
      light: day === 1 ? "起床后 30 分钟内见自然光 15-30 分钟" : "上午见光，傍晚减少强光和刷屏",
      exercise,
      goal: getGoal(day, state, input),
      warnings,
      anchors: [
        { time: wakeTime, label: "起床" },
        { time: day === 1 ? "09:30" : "09:00", label: rules.some((rule) => rule.id === "R_CAFFEINE_SUPPORT") ? "咖啡" : "淡茶" },
        { time: input.napWindow.start, label: napAnchorLabel },
        { time: bedtime, label: "上床" }
      ]
    };
  });
}
