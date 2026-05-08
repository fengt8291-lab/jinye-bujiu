"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bed, Coffee, Footprints, Moon, Sparkles, TimerReset, Waves } from "lucide-react";

type RecoveryLevel = "正常恢复" | "轻度透支" | "中度透支" | "重度透支";

type Plan = {
  level: RecoveryLevel;
  score: number;
  sleepHours: number;
  coffee: string;
  nap: string;
  movement: string;
  tonight: string;
};

const levels: RecoveryLevel[] = ["正常恢复", "轻度透支", "中度透支", "重度透支"];

const levelDetails: Record<
  RecoveryLevel,
  {
    tone: string;
    note: string;
    ring: string;
    wash: string;
  }
> = {
  正常恢复: {
    tone: "text-calm-mint",
    note: "现在是稳定恢复期。",
    ring: "#94e8c3",
    wash: "from-emerald-300/18 via-blue-300/10 to-white/[0.03]"
  },
  轻度透支: {
    tone: "text-calm-blue",
    note: "现在是恢复窗口期。",
    ring: "#8dd7ff",
    wash: "from-blue-300/18 via-indigo-300/10 to-white/[0.03]"
  },
  中度透支: {
    tone: "text-calm-amber",
    note: "你的身体正在慢慢追回节律。",
    ring: "#f1bd6b",
    wash: "from-amber-300/18 via-blue-300/10 to-white/[0.03]"
  },
  重度透支: {
    tone: "text-[#ff9f9f]",
    note: "今晚比昨天更重要。",
    ring: "#ff9f9f",
    wash: "from-rose-300/18 via-blue-300/10 to-white/[0.03]"
  }
};

const loadingLines = ["正在生成恢复计划…", "正在分析你的恢复节律…", "正在整理今天的能量边界…"];

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getSleepHours(sleptAt: string, wokeAt: string) {
  const start = timeToMinutes(sleptAt);
  const end = timeToMinutes(wokeAt);
  const minutes = end >= start ? end - start : end + 24 * 60 - start;
  return Math.round((minutes / 60) * 10) / 10;
}

function buildPlan(
  sleepHours: number,
  energy: number,
  hasSchedule: boolean,
  canNap: boolean
): Plan {
  let levelIndex = 0;

  if (sleepHours < 4) levelIndex = 3;
  else if (sleepHours < 5.5) levelIndex = 2;
  else if (sleepHours < 7) levelIndex = 1;

  if (energy <= 4) {
    levelIndex = Math.min(levelIndex + 1, levels.length - 1);
  }

  const level = levels[levelIndex];
  const score = Math.max(28, 92 - levelIndex * 18 - Math.max(0, 6 - energy) * 3);

  const coffeeByLevel = [
    "今天不必靠咖啡硬撑。如果想喝，上午一小杯就好，下午尽量留给身体自己降速。",
    "建议上午 9:30-11:00 之间喝 1 杯，下午 2 点后尽量不再补咖啡。",
    "可以喝 1 杯，但别连着续杯。它能帮你启动，不适合替代休息。",
    "咖啡只做短暂救急。若有重要安排，上午少量饮用；下午开始给今晚入睡让路。"
  ];

  const nap = canNap
    ? levelIndex <= 1
      ? "午后安排 15-20 分钟短睡，醒来后喝水、见一点自然光，节奏会更稳。"
      : "如果条件允许，午睡 20 分钟以内。别睡太久，今天的目标是缓过来，不是把作息推得更晚。"
    : "今天不能午睡也没关系。把任务拆小，中间留 5 分钟闭眼或散步，恢复会一点点回来。";

  const scheduleNote = hasSchedule
    ? "有早课或重要安排，先保住必要任务，把不紧急的事往后放。"
    : "今天不用把效率拉满，适合用低强度节奏慢慢找回状态。";

  const movementByLevel = [
    "傍晚轻快走 15-20 分钟，帮身体重新对齐白天和夜晚。",
    "做 10-15 分钟拉伸或慢走，够了。重点是醒一醒，不是消耗自己。",
    "只做轻度活动，比如下楼走一圈或拉伸肩颈。今天先别挑战高强度运动。",
    "避免剧烈运动。能散步就散步，不能也没关系，身体现在更需要稳定。"
  ];

  const tonightByLevel = [
    "今晚按平常时间上床，睡前 45 分钟放下屏幕，别为了“补回来”睡得太早。",
    "争取比平时提前 30 分钟上床。睡前做点轻松的事，让大脑慢慢收尾。",
    "今晚把恢复放在第一位，尽量提前 45-60 分钟结束学习和刷手机。",
    "今晚别再加码了。提前收工、洗个热水澡、把手机放远一点，先让身体回来。"
  ];

  return {
    level,
    score,
    sleepHours,
    coffee: `${scheduleNote}${coffeeByLevel[levelIndex]}`,
    nap,
    movement: movementByLevel[levelIndex],
    tonight: tonightByLevel[levelIndex]
  };
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] shadow-inner shadow-white/5">
      {children}
    </span>
  );
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
      className="soft-row flex min-h-[5.15rem] w-full items-center justify-between gap-4 rounded-[1.35rem] px-4 py-3.5 text-left transition duration-200 active:scale-[0.99]"
    >
      <span>
        <span className="block text-[0.98rem] font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm text-slate-400">{hint}</span>
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

function ResultCard({
  icon,
  title,
  accent,
  children
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <article className="glass-panel flex gap-4 rounded-[1.35rem] p-4">
      <div className={accent}>
        <Icon>{icon}</Icon>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{children}</p>
      </div>
    </article>
  );
}

export default function Home() {
  const [sleptAt, setSleptAt] = useState("02:30");
  const [wokeAt, setWokeAt] = useState("08:20");
  const [energy, setEnergy] = useState(4);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [canNap, setCanNap] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sleepHours = useMemo(() => getSleepHours(sleptAt, wokeAt), [sleptAt, wokeAt]);
  const plan = useMemo(
    () => buildPlan(sleepHours, energy, hasSchedule, canNap),
    [sleepHours, energy, hasSchedule, canNap]
  );

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

  const levelDetail = levelDetails[plan.level];

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
            {isLoading ? "生成中…" : "生成今日恢复计划"}
          </button>

          <div className="glass-panel rounded-[2.1rem] p-4 text-left sm:p-5">
            <div className="mb-5 flex items-center justify-between px-1">
              <div>
                <p className="text-lg font-semibold text-white">告诉我你的情况</p>
                <p className="mt-1 text-sm text-slate-400">只用于生成这一次计划</p>
              </div>
              <span className="text-xs text-slate-500">本地计算</span>
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
                hint="会影响恢复节奏"
              />
              <Toggle checked={canNap} onChange={setCanNap} label="今天能午睡吗" hint="有助于下午恢复" />
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
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-calm-blue">计划已生成</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">今日恢复计划</h2>
            </div>
            <p className="text-sm text-slate-500">{plan.sleepHours}h 睡眠</p>
          </div>

          <div className="space-y-3">
            <article className={`glass-panel overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${levelDetail.wash} p-5`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">恢复等级</p>
                  <p className={`mt-2 text-3xl font-semibold ${levelDetail.tone}`}>{plan.level}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{levelDetail.note}</p>
                </div>
                <div className="relative grid h-[6.4rem] w-[6.4rem] shrink-0 place-items-center rounded-full border border-white/10 bg-black/10">
                  <div
                    className="absolute inset-2 rounded-full"
                    style={{
                      background: `conic-gradient(${levelDetail.ring} ${plan.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
                    }}
                  />
                  <div className="absolute inset-[0.9rem] rounded-full bg-night-900/95" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="block text-[2rem] font-semibold leading-none text-white">{plan.score}</span>
                    <span className="mt-1 block text-[0.68rem] font-medium leading-none text-slate-500">REST</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
                <p className="text-sm leading-6 text-slate-300">
                  先稳住今天的节奏。你不是没状态，只是身体还在追上来。
                </p>
              </div>
            </article>

            <ResultCard
              icon={<Coffee className="h-5 w-5" strokeWidth={1.8} />}
              title="咖啡建议"
              accent="text-calm-amber"
            >
              {plan.coffee}
            </ResultCard>
            <ResultCard
              icon={<Bed className="h-5 w-5" strokeWidth={1.8} />}
              title="午睡建议"
              accent="text-calm-mint"
            >
              {plan.nap}
            </ResultCard>
            <ResultCard
              icon={<Footprints className="h-5 w-5" strokeWidth={1.8} />}
              title="运动建议"
              accent="text-calm-violet"
            >
              {plan.movement}
            </ResultCard>
            <ResultCard
              icon={<TimerReset className="h-5 w-5" strokeWidth={1.8} />}
              title="今晚建议"
              accent="text-calm-blue"
            >
              {plan.tonight}
            </ResultCard>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-blue-100/10 bg-blue-100/[0.045] px-5 py-4 text-center">
            <p className="text-sm leading-6 text-slate-300">
              今天不用追回所有进度。先把身体带回稳定的节律里，明天会更轻一点。
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
