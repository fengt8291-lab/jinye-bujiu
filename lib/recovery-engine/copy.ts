import { RecoveryStage } from "./types";

export const stageCopy: Record<
  RecoveryStage,
  {
    label: string;
    brief: string;
    target: string;
    tone: string;
    ring: string;
    wash: string;
  }
> = {
  NORMAL: {
    label: "状态基本稳住",
    brief: "今天不用过度补偿，保持固定起床点就好。",
    target: "保持节奏",
    tone: "text-calm-mint",
    ring: "#94e8c3",
    wash: "from-emerald-300/18 via-blue-300/10 to-white/[0.03]"
  },
  MILD_SLEEP_DEBT: {
    label: "有一点透支",
    brief: "先把今天稳住，不需要一次把睡眠补完。",
    target: "稳住今天",
    tone: "text-calm-blue",
    ring: "#8dd7ff",
    wash: "from-blue-300/18 via-indigo-300/10 to-white/[0.03]"
  },
  MODERATE_SLEEP_DEBT: {
    label: "睡眠债偏高",
    brief: "身体在追赶昨晚的缺口，今天先降低消耗。",
    target: "减少透支",
    tone: "text-calm-amber",
    ring: "#f1bd6b",
    wash: "from-amber-300/18 via-blue-300/10 to-white/[0.03]"
  },
  SEVERE_SLEEP_DEBT: {
    label: "今天先止损",
    brief: "睡得太少时，目标不是高效，是别继续透支。",
    target: "优先止损",
    tone: "text-[#ffb4a8]",
    ring: "#ffb4a8",
    wash: "from-orange-300/18 via-rose-300/10 to-white/[0.03]"
  },
  CIRCADIAN_SHIFT: {
    label: "作息有点偏了",
    brief: "入睡和清醒时间已经后移，需要连续几天慢慢拉回。",
    target: "拉回作息",
    tone: "text-calm-amber",
    ring: "#f1bd6b",
    wash: "from-amber-300/18 via-blue-300/10 to-white/[0.03]"
  },
  RECOVERY_PHASE: {
    label: "正在恢复中",
    brief: "继续保持固定起床点，恢复会一点点变轻。",
    target: "延续恢复",
    tone: "text-calm-blue",
    ring: "#8dd7ff",
    wash: "from-blue-300/18 via-indigo-300/10 to-white/[0.03]"
  },
  STABLE: {
    label: "节奏较稳定",
    brief: "今天重点是别打乱已经恢复的节奏。",
    target: "保持稳定",
    tone: "text-calm-mint",
    ring: "#94e8c3",
    wash: "from-emerald-300/18 via-blue-300/10 to-white/[0.03]"
  }
};

export function trajectoryLabel(trajectory: string) {
  const labels: Record<string, string> = {
    STABILIZE: "稳定模式",
    GRADUAL_ADVANCE: "逐步拉回",
    DEBT_RECOVERY: "睡眠债恢复",
    COGNITIVE_PROTECTION: "白天保功能",
    MIXED: "止损加回调"
  };

  return labels[trajectory] || trajectory;
}
