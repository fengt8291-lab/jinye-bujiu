"use client";

import { FormEvent, useMemo, useState } from "react";
import { Moon, Sparkles, Waves } from "lucide-react";

type RecoveryLevel = "正常恢复" | "轻度透支" | "中度透支" | "重度透支";
type RecoveryStage = "急性睡眠透支" | "节律漂移" | "恢复窗口期" | "稳定恢复期" | "二次崩盘风险";

type FutureConstraints = {
  tomorrowEarlyClass: boolean;
  tomorrowBrainLoad: boolean;
  tomorrowCanNap: boolean;
  mustStayUp: boolean;
  fixedWakeTime: boolean;
  canExercise: boolean;
  dormLimit: boolean;
};

type TimelineDay = {
  day: number;
  stage: string;
  sleepWindow: string;
  wakeTime: string;
  napWindow: string;
  caffeineWindow: string;
  teaAdvice: string;
  lightAdvice: string;
  movement: string;
  goal: string;
};

type RecoveryPlan = {
  level: RecoveryLevel;
  stage: RecoveryStage;
  score: number;
  sleepHours: number;
  sleepDebt: string;
  risk: string;
  targetLine: string;
  timeline: TimelineDay[];
};

const levels: RecoveryLevel[] = ["正常恢复", "轻度透支", "中度透支", "重度透支"];

const stageDetails: Record<
  RecoveryStage,
  {
    tone: string;
    ring: string;
    wash: string;
    brief: string;
    target: string;
  }
> = {
  急性睡眠透支: {
    tone: "text-[#ff9f9f]",
    ring: "#ff9f9f",
    wash: "from-rose-300/18 via-blue-300/10 to-white/[0.03]",
    brief: "身体还在追赶睡眠债，今天先防止继续透支。",
    target: "停止加码"
  },
  节律漂移: {
    tone: "text-calm-amber",
    ring: "#f1bd6b",
    wash: "from-amber-300/18 via-blue-300/10 to-white/[0.03]",
    brief: "入睡和清醒节奏已经偏移，需要连续几天慢慢拉回。",
    target: "回调节律"
  },
  恢复窗口期: {
    tone: "text-calm-blue",
    ring: "#8dd7ff",
    wash: "from-blue-300/18 via-indigo-300/10 to-white/[0.03]",
    brief: "今天是恢复窗口，不适合硬扛，也不需要一下子补完。",
    target: "稳定节奏"
  },
  稳定恢复期: {
    tone: "text-calm-mint",
    ring: "#94e8c3",
    wash: "from-emerald-300/18 via-blue-300/10 to-white/[0.03]",
    brief: "状态基本可控，重点是保持起床时间和晚间收尾。",
    target: "保持稳定"
  },
  二次崩盘风险: {
    tone: "text-[#ffb4a8]",
    ring: "#ffb4a8",
    wash: "from-orange-300/18 via-rose-300/10 to-white/[0.03]",
    brief: "如果今晚继续拖延，明后天会更难恢复。",
    target: "优先止损"
  }
};

const loadingLines = ["正在生成恢复计划…", "正在分析你的恢复节律…", "正在整理未来几天的恢复窗口…"];

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number) {
  const minutesInDay = 24 * 60;
  const normalized = ((Math.round(totalMinutes) % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toSleepCoordinate(time: string) {
  const minutes = timeToMinutes(time);
  return minutes < 12 * 60 ? minutes + 24 * 60 : minutes;
}

function toWakeCoordinate(time: string) {
  const minutes = timeToMinutes(time);
  return minutes < 12 * 60 ? minutes + 24 * 60 : minutes;
}

function getSleepHours(sleptAt: string, wokeAt: string) {
  const start = timeToMinutes(sleptAt);
  const end = timeToMinutes(wokeAt);
  const minutes = end >= start ? end - start : end + 24 * 60 - start;
  return Math.round((minutes / 60) * 10) / 10;
}

function getSeverity(sleepHours: number, energy: number) {
  let severity = 0;

  if (sleepHours < 4) severity = 3;
  else if (sleepHours < 5.5) severity = 2;
  else if (sleepHours < 7) severity = 1;

  if (energy <= 4) {
    severity = Math.min(severity + 1, levels.length - 1);
  }

  return severity;
}

function getStage(severity: number, energy: number, constraints: FutureConstraints): RecoveryStage {
  if ((severity >= 2 && constraints.mustStayUp) || (severity === 3 && energy <= 4)) {
    return "二次崩盘风险";
  }

  if (severity === 3) return "急性睡眠透支";
  if (severity === 2) return "节律漂移";
  if (severity === 1) return "恢复窗口期";

  return "稳定恢复期";
}

function getTimelineLength(severity: number, stage: RecoveryStage) {
  if (stage === "二次崩盘风险" || severity >= 3) return 5;
  if (severity === 2) return 4;
  return 3;
}

function getSleepDebt(sleepHours: number) {
  const debt = Math.max(0, Math.round((7.5 - sleepHours) * 10) / 10);

  if (debt <= 0.3) return "轻微或无睡眠债";
  if (debt < 2) return `约 ${debt}h 睡眠债`;
  return `约 ${debt}h 睡眠债，今天不要追回所有进度`;
}

function getRisk(severity: number, constraints: FutureConstraints) {
  if (constraints.mustStayUp) return "二次透支风险高";
  if (!constraints.fixedWakeTime && severity >= 2) return "节律继续漂移风险";
  if (constraints.tomorrowBrainLoad && severity >= 1) return "明天用脑负荷偏高";
  if (severity >= 2) return "下午崩盘风险";
  return "风险可控";
}

function getWakeTime(day: number, wokeAt: string, hasSchedule: boolean, constraints: FutureConstraints) {
  if (constraints.fixedWakeTime || hasSchedule || constraints.tomorrowEarlyClass) {
    return constraints.tomorrowEarlyClass ? "07:30" : wokeAt;
  }

  const driftBack = Math.max(0, day - 1) * -20;
  const relaxedStart = day === 1 ? Math.min(timeToMinutes(wokeAt) + 20, 9 * 60) : timeToMinutes(wokeAt);
  return formatTime(relaxedStart + driftBack);
}

function getSleepWindow(day: number, sleptAt: string, wakeTime: string, severity: number, constraints: FutureConstraints) {
  const desiredSleepMinutes = severity >= 3 ? 8 * 60 : severity === 2 ? 7.5 * 60 : 7 * 60;
  const targetByWake = toWakeCoordinate(wakeTime) - desiredSleepMinutes;
  const stepBack = Math.min(day * 30, 150);
  const targetByDrift = toSleepCoordinate(sleptAt) - stepBack;
  let latest = Math.max(targetByWake, targetByDrift);

  if (constraints.dormLimit) {
    latest = Math.min(latest, 24 * 60 + 10);
  }

  if (constraints.mustStayUp && day === 1) {
    latest = Math.max(latest, toSleepCoordinate(sleptAt) - 30);
  }

  return formatTime(latest);
}

function getNapWindow(day: number, severity: number, canNapToday: boolean, constraints: FutureConstraints) {
  const canNap = day === 1 ? canNapToday : constraints.tomorrowCanNap;

  if (!canNap) return "不安排午睡；13:30 前后闭眼 8 分钟";
  if (day > 2 && severity < 3) return "不再午睡，保留夜间睡眠压力";
  if (day > 3) return "不再午睡，避免推迟今晚入睡";

  const duration = severity >= 3 ? 25 : 20;
  return `13:00-14:00 之间允许 ${duration} 分钟`;
}

function getCaffeineWindow(day: number, severity: number, constraints: FutureConstraints) {
  if (severity >= 3 && day === 1) return "仅 09:00-12:30，之后停止";
  if (constraints.mustStayUp && day === 1) return "仅 09:00-13:00，不用咖啡续命";
  if (day === 1) return severity >= 2 ? "仅 09:00-13:00" : "09:00-14:00 后停止";
  if (day === 2) return "09:00-12:00，减少到半杯";
  return "不主动安排咖啡因";
}

function getTeaAdvice(day: number, severity: number) {
  if (day === 1 && severity >= 2) return "低浓度绿茶；16:00 后不喝浓茶";
  if (day === 1) return "淡茶可以，傍晚后换水";
  if (day === 2) return "只保留上午淡茶";
  return "晚间不喝茶，给入睡留空间";
}

function getMovement(day: number, severity: number, constraints: FutureConstraints) {
  if (!constraints.canExercise) return "不安排运动；晚饭后走 8-10 分钟";
  if (severity >= 3) return day <= 2 ? "仅轻走 10 分钟，不做高强度" : "低强度拉伸 10-15 分钟";
  if (severity === 2) return day <= 2 ? "轻走或拉伸 10-15 分钟" : "恢复到中低强度活动";
  return "傍晚轻快走 15-20 分钟";
}

function getGoal(day: number, severity: number, stage: RecoveryStage, constraints: FutureConstraints) {
  if (stage === "二次崩盘风险" && day === 1) return "今晚的目标不是高效，是停止继续透支";
  if (day === 1) return severity >= 2 ? "防止节律继续漂移" : "先把今天的节奏稳住";
  if (day === 2) return "恢复睡眠压力，减少白天刺激";
  if (day === 3) return "把入睡窗口拉回可控范围";
  if (constraints.mustStayUp) return "在现实安排里保住固定起床点";
  return "稳定昼夜节律";
}

function buildTimeline(
  severity: number,
  stage: RecoveryStage,
  sleptAt: string,
  wokeAt: string,
  hasSchedule: boolean,
  canNapToday: boolean,
  constraints: FutureConstraints
) {
  const length = getTimelineLength(severity, stage);

  return Array.from({ length }, (_, index) => {
    const day = index + 1;
    const wakeTime = getWakeTime(day, wokeAt, hasSchedule, constraints);
    const sleepWindow = getSleepWindow(day, sleptAt, wakeTime, severity, constraints);
    const stageName =
      day === 1
        ? stage
        : day === 2
          ? severity >= 2
            ? "节律回调"
            : "恢复窗口"
          : day === length
            ? "恢复稳定"
            : "稳定推进";

    return {
      day,
      stage: stageName,
      sleepWindow,
      wakeTime,
      napWindow: getNapWindow(day, severity, canNapToday, constraints),
      caffeineWindow: getCaffeineWindow(day, severity, constraints),
      teaAdvice: getTeaAdvice(day, severity),
      lightAdvice: day === 1 ? "起床后 30 分钟内见自然光" : "上午见光，傍晚降低强光刺激",
      movement: getMovement(day, severity, constraints),
      goal: getGoal(day, severity, stage, constraints)
    };
  });
}

function buildPlan(
  sleptAt: string,
  wokeAt: string,
  energy: number,
  hasSchedule: boolean,
  canNap: boolean,
  constraints: FutureConstraints
): RecoveryPlan {
  const sleepHours = getSleepHours(sleptAt, wokeAt);
  const baseSeverity = getSeverity(sleepHours, energy);
  const riskBoost = [constraints.mustStayUp, !constraints.fixedWakeTime, constraints.tomorrowBrainLoad].filter(Boolean).length;
  const severity = Math.min(baseSeverity + (riskBoost >= 2 ? 1 : 0), levels.length - 1);
  const stage = getStage(severity, energy, constraints);
  const score = Math.max(22, 94 - severity * 17 - Math.max(0, 6 - energy) * 3 - riskBoost * 4);

  return {
    level: levels[severity],
    stage,
    score,
    sleepHours,
    sleepDebt: getSleepDebt(sleepHours),
    risk: getRisk(severity, constraints),
    targetLine: stageDetails[stage].brief,
    timeline: buildTimeline(severity, stage, sleptAt, wokeAt, hasSchedule, canNap, constraints)
  };
}

function Toggle({
  checked,
  onChange,
  label,
  hint
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="soft-row flex min-h-[5.05rem] w-full items-center justify-between gap-4 rounded-[1.35rem] px-4 py-3.5 text-left transition duration-200 active:scale-[0.99]"
    >
      <span className="min-w-0">
        <span className="block text-[0.98rem] font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-400">{hint}</span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition ${
          checked ? "bg-calm-blue shadow-glow" : "bg-white/12"
        }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow-lg transition ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-3.5 py-3">
      <p className="text-[0.72rem] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-100">{value}</p>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.8rem_1fr] gap-3 text-sm leading-6">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  );
}

export default function Home() {
  const [sleptAt, setSleptAt] = useState("02:30");
  const [wokeAt, setWokeAt] = useState("08:20");
  const [energy, setEnergy] = useState(4);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [canNap, setCanNap] = useState(true);
  const [constraints, setConstraints] = useState<FutureConstraints>({
    tomorrowEarlyClass: false,
    tomorrowBrainLoad: true,
    tomorrowCanNap: true,
    mustStayUp: false,
    fixedWakeTime: true,
    canExercise: true,
    dormLimit: false
  });
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const plan = useMemo(
    () => buildPlan(sleptAt, wokeAt, energy, hasSchedule, canNap, constraints),
    [sleptAt, wokeAt, energy, hasSchedule, canNap, constraints]
  );

  function updateConstraint(key: keyof FutureConstraints, value: boolean) {
    setConstraints((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setGenerated(false);
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setGenerated(true);
      window.setTimeout(() => {
        document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }, 1750);
  }

  const stageDetail = stageDetails[plan.stage];

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-12 pt-12 sm:px-6 sm:pt-14">
      <div className="hero-glow" aria-hidden="true" />

      <section className="relative mx-auto flex w-full max-w-[28rem] flex-col items-center text-center">
        <div className="relative mb-7 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-blue-100/20 bg-blue-100/10 shadow-glow">
          <span className="absolute inset-[-0.65rem] rounded-full border border-blue-100/10" />
          <Moon className="h-8 w-8 text-blue-100" aria-hidden="true" strokeWidth={1.6} />
        </div>

        <h1 className="text-[3.35rem] font-semibold leading-none tracking-normal text-white sm:text-[3.85rem]">
          今夜补救
        </h1>
        <p className="mt-5 text-lg font-medium leading-7 text-slate-300">昨晚熬夜了？今天别硬扛。</p>

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-5">
          <button
            type="submit"
            disabled={isLoading}
            className="mx-auto flex h-[4.15rem] w-full max-w-[22rem] items-center justify-center gap-3 rounded-full border border-blue-100/30 bg-gradient-to-r from-[#607dff] to-[#91b8ff] px-6 text-[1.05rem] font-semibold text-white shadow-glow transition duration-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
          >
            <Sparkles className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""}`} aria-hidden="true" strokeWidth={1.8} />
            {isLoading ? "生成中…" : "生成恢复时间轴"}
          </button>

          <div className="glass-panel rounded-[2.1rem] p-4 text-left sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-lg font-semibold text-white">告诉我你的情况</p>
                <p className="mt-1 text-sm text-slate-400">只用于生成这一次计划</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">本地计算</span>
            </div>

            <div className="space-y-3.5">
              <label className="soft-row flex min-h-[5.15rem] items-center justify-between gap-4 rounded-[1.35rem] px-4 py-3.5">
                <span>
                  <span className="block text-[0.98rem] font-semibold text-white">昨晚几点睡</span>
                  <span className="mt-1 block text-sm text-slate-400">睡着的大概时间</span>
                </span>
                <input
                  type="time"
                  value={sleptAt}
                  onChange={(event) => setSleptAt(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-base font-semibold text-slate-100 outline-none"
                />
              </label>

              <label className="soft-row flex min-h-[5.15rem] items-center justify-between gap-4 rounded-[1.35rem] px-4 py-3.5">
                <span>
                  <span className="block text-[0.98rem] font-semibold text-white">今天几点起</span>
                  <span className="mt-1 block text-sm text-slate-400">真正起床的时间</span>
                </span>
                <input
                  type="time"
                  value={wokeAt}
                  onChange={(event) => setWokeAt(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-base font-semibold text-slate-100 outline-none"
                />
              </label>

              <div className="soft-row rounded-[1.35rem] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.98rem] font-semibold text-white">今日精神状态</p>
                    <p className="mt-1 text-sm text-slate-400">1 很差 · 10 很好</p>
                  </div>
                  <span className="grid h-12 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl font-semibold text-white">
                    {energy}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(event) => setEnergy(Number(event.target.value))}
                  style={{ "--value": `${((energy - 1) / 9) * 100}%` } as React.CSSProperties}
                  className="mt-6 w-full"
                  aria-label="今日精神状态"
                />
                <div className="mt-2 flex justify-between text-sm text-slate-400">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              <Toggle
                checked={hasSchedule}
                onChange={setHasSchedule}
                label="今天有早课/重要安排吗"
                hint="会影响今天的恢复节奏"
              />
              <Toggle checked={canNap} onChange={setCanNap} label="今天能午睡吗" hint="只安排短睡，不补成昏睡" />
            </div>
          </div>

          <div className="glass-panel rounded-[2.1rem] p-4 text-left sm:p-5">
            <div className="mb-5 px-1">
              <p className="text-lg font-semibold text-white">未来几天安排</p>
              <p className="mt-1 text-sm text-slate-400">轻量约束，用来生成现实可执行的调度</p>
            </div>

            <div className="space-y-3.5">
              <Toggle
                checked={constraints.tomorrowEarlyClass}
                onChange={(value) => updateConstraint("tomorrowEarlyClass", value)}
                label="明天有早课吗"
                hint="会优先锁定起床时间"
              />
              <Toggle
                checked={constraints.tomorrowBrainLoad}
                onChange={(value) => updateConstraint("tomorrowBrainLoad", value)}
                label="明天高强度用脑吗"
                hint="考试、ddl、长时间学习"
              />
              <Toggle
                checked={constraints.tomorrowCanNap}
                onChange={(value) => updateConstraint("tomorrowCanNap", value)}
                label="明天能午睡吗"
                hint="只用于 Day 2 的恢复窗口"
              />
              <Toggle
                checked={constraints.mustStayUp}
                onChange={(value) => updateConstraint("mustStayUp", value)}
                label="最近几天必须熬夜吗"
                hint="计划会改成止损模式"
              />
              <Toggle
                checked={constraints.fixedWakeTime}
                onChange={(value) => updateConstraint("fixedWakeTime", value)}
                label="能固定起床时间吗"
                hint="恢复节律最重要的锚点"
              />
              <Toggle
                checked={constraints.canExercise}
                onChange={(value) => updateConstraint("canExercise", value)}
                label="这几天可以运动吗"
                hint="只安排轻运动，不做自律挑战"
              />
              <Toggle
                checked={constraints.dormLimit}
                onChange={(value) => updateConstraint("dormLimit", value)}
                label="有宿舍断电/门禁限制吗"
                hint="睡眠窗口会避开不可控时段"
              />
            </div>
          </div>
        </form>
      </section>

      {isLoading ? (
        <section className="mx-auto mt-7 w-full max-w-[28rem]">
          <div className="glass-panel loading-card rounded-[2rem] px-5 py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-blue-100/20 bg-white/[0.05]">
              <Waves className="h-7 w-7 animate-pulse text-calm-cyan" aria-hidden="true" strokeWidth={1.7} />
            </div>
            <div className="mt-5 space-y-2">
              {loadingLines.map((line, index) => (
                <p
                  key={line}
                  className={`text-sm font-medium text-slate-300 ${index === 0 ? "text-base text-white" : "opacity-60"}`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {generated ? (
        <section id="plan" className="mx-auto mt-8 w-full max-w-[28rem] scroll-mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-calm-blue">调度已生成</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">今日恢复状态</h2>
            </div>
            <p className="shrink-0 text-sm text-slate-500">{plan.sleepHours}h 睡眠</p>
          </div>

          <article className={`glass-panel overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${stageDetail.wash} p-5`}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-400">当前恢复阶段</p>
                <p className={`mt-2 text-[1.65rem] font-semibold leading-tight min-[390px]:text-[1.9rem] ${stageDetail.tone}`}>
                  {plan.stage}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{plan.targetLine}</p>
              </div>
              <div className="relative grid h-[6.4rem] w-[6.4rem] shrink-0 place-items-center rounded-full border border-white/10 bg-black/10">
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: `conic-gradient(${stageDetail.ring} ${plan.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
                  }}
                />
                <div className="absolute inset-[0.9rem] rounded-full bg-night-900/95" />
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <span className="block text-[2rem] font-semibold leading-none text-white">{plan.score}</span>
                  <span className="mt-1 block text-[0.68rem] font-medium leading-none text-slate-500">REST</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatusPill label="恢复等级" value={plan.level} />
              <StatusPill label="恢复目标" value={stageDetail.target} />
              <StatusPill label="睡眠债状态" value={plan.sleepDebt} />
              <StatusPill label="当前风险" value={plan.risk} />
            </div>
          </article>

          <div className="mt-7 mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-calm-blue">未来恢复时间轴</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{plan.timeline.length} 天调度计划</h2>
            </div>
            <p className="text-xs text-slate-500">本地规则</p>
          </div>

          <div className="relative space-y-4">
            <div className="absolute bottom-8 left-[1.05rem] top-7 w-px bg-blue-100/15" aria-hidden="true" />
            {plan.timeline.map((day) => (
              <article key={day.day} className="relative pl-8">
                <span className="absolute left-0 top-6 grid h-9 w-9 place-items-center rounded-full border border-blue-100/20 bg-[#111d34] text-sm font-semibold text-calm-blue shadow-glow">
                  {day.day}
                </span>
                <div className="glass-panel rounded-[1.55rem] p-4">
                  <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Day {day.day}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{day.stage}</h3>
                    </div>
                    <span className="max-w-full rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium leading-5 text-slate-300">
                      {day.goal}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <TimelineRow label="最晚入睡" value={`${day.sleepWindow} 进入睡眠窗口`} />
                    <TimelineRow label="起床时间" value={day.wakeTime} />
                    <TimelineRow label="午睡" value={day.napWindow} />
                    <TimelineRow label="咖啡因" value={day.caffeineWindow} />
                    <TimelineRow label="茶" value={day.teaAdvice} />
                    <TimelineRow label="光照" value={day.lightAdvice} />
                    <TimelineRow label="运动" value={day.movement} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-blue-100/10 bg-blue-100/[0.045] px-5 py-4 text-center">
            <p className="text-sm leading-6 text-slate-300">
              今天先别追回所有进度。先把节律稳住，恢复会从一个固定的起床点开始。
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
