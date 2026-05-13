"use client";

import { FormEvent, useMemo, useState } from "react";
import { Moon, Sparkles, Waves } from "lucide-react";
import { buildRecoveryPlan, stageCopy, trajectoryLabel, RecoveryEngineInput } from "@/lib/recovery-engine";

const loadingLines = ["正在生成恢复计划…", "正在分析你的恢复节奏…", "正在整理未来几天的安排…"];

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

function TimeField({
  label,
  hint,
  value,
  onChange
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="soft-row flex min-h-[5.15rem] items-center justify-between gap-4 rounded-[1.35rem] px-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-[0.98rem] font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-400">{hint}</span>
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-base font-semibold text-slate-100 outline-none"
      />
    </label>
  );
}

function CompactTimeField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-3.5 py-3">
      <span className="block text-xs font-medium text-slate-500">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full bg-transparent text-base font-semibold text-slate-100 outline-none"
      />
    </label>
  );
}

function DetailTimes({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 px-1">{children}</div>;
}

function StatusPill({ label, value }: { label: string; value: string | number }) {
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
  const [sleepStart, setSleepStart] = useState("02:30");
  const [wakeTime, setWakeTime] = useState("08:20");
  const [energy, setEnergy] = useState(4);
  const [todayImportant, setTodayImportant] = useState(false);
  const [todayImportantTime, setTodayImportantTime] = useState("10:00");
  const [tomorrowEarlyClass, setTomorrowEarlyClass] = useState(false);
  const [tomorrowClassTime, setTomorrowClassTime] = useState("08:00");
  const [tomorrowBrainLoad, setTomorrowBrainLoad] = useState(true);
  const [targetWakeTime, setTargetWakeTime] = useState("08:00");
  const [canNapToday, setCanNapToday] = useState(true);
  const [canNapTomorrow, setCanNapTomorrow] = useState(true);
  const [napStart, setNapStart] = useState("13:00");
  const [napEnd, setNapEnd] = useState("14:00");
  const [mustStayUp, setMustStayUp] = useState(false);
  const [mustStayUpUntil, setMustStayUpUntil] = useState("01:30");
  const [fixedWakeTime, setFixedWakeTime] = useState(true);
  const [canExercise, setCanExercise] = useState(true);
  const [exerciseStart, setExerciseStart] = useState("18:30");
  const [exerciseEnd, setExerciseEnd] = useState("20:00");
  const [dormLimit, setDormLimit] = useState(false);
  const [dormPowerOffStart, setDormPowerOffStart] = useState("23:30");
  const [dormPowerOffEnd, setDormPowerOffEnd] = useState("06:00");
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const engineInput = useMemo<RecoveryEngineInput>(
    () => ({
      sleepStart,
      wakeTime,
      energy,
      todayImportant,
      todayImportantTime: todayImportant ? todayImportantTime : undefined,
      tomorrowEarlyClass,
      tomorrowClassTime: tomorrowEarlyClass ? tomorrowClassTime : undefined,
      tomorrowBrainLoad,
      targetWakeTime,
      canNapToday,
      canNapTomorrow,
      napWindow: { start: napStart, end: napEnd },
      canExercise,
      exerciseWindow: { start: exerciseStart, end: exerciseEnd },
      dormPowerOff: dormLimit ? { start: dormPowerOffStart, end: dormPowerOffEnd } : undefined,
      mustStayUp,
      mustStayUpUntil: mustStayUp ? mustStayUpUntil : undefined,
      fixedWakeTime
    }),
    [
      sleepStart,
      wakeTime,
      energy,
      todayImportant,
      todayImportantTime,
      tomorrowEarlyClass,
      tomorrowClassTime,
      tomorrowBrainLoad,
      targetWakeTime,
      canNapToday,
      canNapTomorrow,
      napStart,
      napEnd,
      canExercise,
      exerciseStart,
      exerciseEnd,
      dormLimit,
      dormPowerOffStart,
      dormPowerOffEnd,
      mustStayUp,
      mustStayUpUntil,
      fixedWakeTime
    ]
  );

  const plan = useMemo(() => buildRecoveryPlan(engineInput), [engineInput]);

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

  const stageDetail = stageCopy[plan.stage];

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
              <TimeField label="昨晚几点睡" hint="睡着的大概时间" value={sleepStart} onChange={setSleepStart} />
              <TimeField label="今天几点起" hint="真正起床的时间" value={wakeTime} onChange={setWakeTime} />

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
                checked={todayImportant}
                onChange={setTodayImportant}
                label="今天有早课/重要安排吗"
                hint="打开后会优先保住白天功能"
              />
              {todayImportant ? (
                <DetailTimes>
                  <CompactTimeField label="重要事项时间" value={todayImportantTime} onChange={setTodayImportantTime} />
                  <CompactTimeField label="目标起床时间" value={targetWakeTime} onChange={setTargetWakeTime} />
                </DetailTimes>
              ) : null}

              <Toggle checked={canNapToday} onChange={setCanNapToday} label="今天能午睡吗" hint="只安排短睡，不补成昏睡" />
            </div>
          </div>

          <div className="glass-panel rounded-[2.1rem] p-4 text-left sm:p-5">
            <div className="mb-5 px-1">
              <p className="text-lg font-semibold text-white">未来几天安排</p>
              <p className="mt-1 text-sm text-slate-400">轻量约束，用来生成现实可执行的调度</p>
            </div>

            <div className="space-y-3.5">
              <Toggle
                checked={tomorrowEarlyClass}
                onChange={setTomorrowEarlyClass}
                label="明天有早课吗"
                hint="会优先锁定起床时间"
              />
              {tomorrowEarlyClass ? (
                <DetailTimes>
                  <CompactTimeField label="早课时间" value={tomorrowClassTime} onChange={setTomorrowClassTime} />
                  <CompactTimeField label="目标起床" value={targetWakeTime} onChange={setTargetWakeTime} />
                </DetailTimes>
              ) : (
                <TimeField label="目标起床时间" hint="作为未来几天的固定起床点" value={targetWakeTime} onChange={setTargetWakeTime} />
              )}

              <Toggle
                checked={tomorrowBrainLoad}
                onChange={setTomorrowBrainLoad}
                label="明天高强度用脑吗"
                hint="考试、ddl、长时间学习"
              />

              <Toggle
                checked={canNapTomorrow}
                onChange={setCanNapTomorrow}
                label="明天能午睡吗"
                hint="用于 Day 2 的短睡安排"
              />
              {(canNapToday || canNapTomorrow) ? (
                <DetailTimes>
                  <CompactTimeField label="午睡开始" value={napStart} onChange={setNapStart} />
                  <CompactTimeField label="午睡结束" value={napEnd} onChange={setNapEnd} />
                </DetailTimes>
              ) : null}

              <Toggle
                checked={mustStayUp}
                onChange={setMustStayUp}
                label="最近几天必须熬夜吗"
                hint="计划会改成止损模式"
              />
              {mustStayUp ? (
                <TimeField label="最晚可能熬到几点" hint="Day 1 不会强行安排早于这个时间上床" value={mustStayUpUntil} onChange={setMustStayUpUntil} />
              ) : null}

              <Toggle
                checked={fixedWakeTime}
                onChange={setFixedWakeTime}
                label="能固定起床时间吗"
                hint="恢复作息最重要的锚点"
              />

              <Toggle
                checked={canExercise}
                onChange={setCanExercise}
                label="这几天可以运动吗"
                hint="只安排轻运动，不做自律挑战"
              />
              {canExercise ? (
                <DetailTimes>
                  <CompactTimeField label="运动开始" value={exerciseStart} onChange={setExerciseStart} />
                  <CompactTimeField label="运动结束" value={exerciseEnd} onChange={setExerciseEnd} />
                </DetailTimes>
              ) : null}

              <Toggle
                checked={dormLimit}
                onChange={setDormLimit}
                label="有宿舍断电/门禁限制吗"
                hint="会提前安排洗漱和收尾"
              />
              {dormLimit ? (
                <DetailTimes>
                  <CompactTimeField label="限制开始" value={dormPowerOffStart} onChange={setDormPowerOffStart} />
                  <CompactTimeField label="限制结束" value={dormPowerOffEnd} onChange={setDormPowerOffEnd} />
                </DetailTimes>
              ) : null}
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
                <p className="text-sm font-medium text-slate-400">当前状态</p>
                <p className={`mt-2 text-[1.65rem] font-semibold leading-tight min-[390px]:text-[1.9rem] ${stageDetail.tone}`}>
                  {plan.stageLabel}
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
              <StatusPill label="恢复模式" value={trajectoryLabel(plan.trajectory)} />
              <StatusPill label="作息稳定度" value={plan.scores.circadianScore} />
              <StatusPill label="睡眠债状态" value={plan.sleepDebt} />
              <StatusPill label="当前风险" value={plan.risk} />
            </div>
          </article>

          <div className="mt-5 rounded-[1.35rem] border border-blue-100/10 bg-blue-100/[0.045] px-4 py-3">
            <p className="text-xs font-medium text-slate-500">已激活规则</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {plan.rules.slice(0, 4).map((rule) => rule.id).join(" · ")}
            </p>
          </div>

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
                  <div className="mb-4 flex flex-col items-start gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Day {day.day}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{day.headline}</h3>
                    </div>
                    <span className="max-w-full rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium leading-5 text-slate-300">
                      {day.goal}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-4 gap-2 rounded-[1.25rem] border border-white/10 bg-black/10 p-2.5">
                    {day.anchors.map((anchor) => (
                      <div key={`${day.day}-${anchor.label}`} className="text-center">
                        <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-calm-blue shadow-glow" />
                        <p className="text-[0.68rem] font-medium text-slate-500">{anchor.label}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-100">{anchor.time}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    <TimelineRow label="建议上床" value={day.bedtime} />
                    <TimelineRow label="起床时间" value={day.wakeTime} />
                    <TimelineRow label="午睡" value={day.nap} />
                    <TimelineRow label="咖啡因" value={day.caffeine} />
                    <TimelineRow label="茶" value={day.tea} />
                    <TimelineRow label="光照" value={day.light} />
                    <TimelineRow label="运动" value={day.exercise} />
                  </div>

                  {day.warnings.length > 0 ? (
                    <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-3.5 py-3">
                      {day.warnings.map((warning) => (
                        <p key={warning} className="text-sm leading-6 text-slate-300">
                          {warning}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-blue-100/10 bg-blue-100/[0.045] px-5 py-4 text-center">
            <p className="text-sm leading-6 text-slate-300">
              今天先别追回所有进度。固定起床点、减少下午刺激，恢复会从可执行的小安排开始。
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
