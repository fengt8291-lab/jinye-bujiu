import { NormalizedInput, RecoveryEngineInput, TimeWindow } from "./types";

const DEFAULT_NAP_WINDOW: TimeWindow = { start: "13:00", end: "14:00" };
const DEFAULT_EXERCISE_WINDOW: TimeWindow = { start: "18:00", end: "20:00" };

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatTime(totalMinutes: number) {
  const minutesInDay = 24 * 60;
  const normalized = ((Math.round(totalMinutes) % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function toSleepCoordinate(time: string) {
  const minutes = timeToMinutes(time);
  return minutes < 12 * 60 ? minutes + 24 * 60 : minutes;
}

export function toWakeCoordinate(time: string) {
  const minutes = timeToMinutes(time);
  return minutes < 12 * 60 ? minutes + 24 * 60 : minutes;
}

export function getDurationMinutes(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end >= start ? end - start : end + 24 * 60 - start;
}

export function normalizeInput(input: RecoveryEngineInput): NormalizedInput {
  const sleepDurationMinutes = getDurationMinutes(input.sleepStart, input.wakeTime);
  const requiredWakeTime =
    input.tomorrowEarlyClass && input.tomorrowClassTime
      ? input.tomorrowClassTime
      : input.targetWakeTime || input.wakeTime;

  return {
    ...input,
    targetWakeTime: input.targetWakeTime || input.wakeTime,
    tomorrowClassTime: input.tomorrowClassTime || "08:00",
    napWindow: input.napWindow || DEFAULT_NAP_WINDOW,
    exerciseWindow: input.exerciseWindow || DEFAULT_EXERCISE_WINDOW,
    sleepStartMinutes: toSleepCoordinate(input.sleepStart),
    wakeTimeMinutes: toWakeCoordinate(input.wakeTime),
    sleepDurationMinutes,
    sleepHours: Math.round((sleepDurationMinutes / 60) * 10) / 10,
    requiredWakeTime,
    requiredWakeMinutes: toWakeCoordinate(requiredWakeTime)
  };
}
