import { RecoveryRule } from "./types";

export const recoveryRules: RecoveryRule[] = [
  {
    id: "R_WAKE_ANCHOR",
    name: "固定起床锚点",
    description: "优先稳定起床时间，减少作息继续后移。",
    priority: "P1",
    condition: { any: ["circadianShiftHigh", "fixedWakeTime", "earlyClass"] },
    action: "wakeTime",
    evidenceLevel: "strong",
    references: ["CBT-I", "Circadian entrainment"]
  },
  {
    id: "R_NO_VIOLENT_EARLY_SLEEP",
    name: "避免暴力早睡",
    description: "入睡时间每天最多提前 30-60 分钟，避免强迫入睡。",
    priority: "P1",
    condition: { any: ["circadianShiftHigh", "lateSleep"] },
    action: "bedtime",
    evidenceLevel: "strong",
    references: ["CBT-I sleep restriction", "Two-Process Model"]
  },
  {
    id: "R_GRADUAL_ADVANCE",
    name: "渐进回调",
    description: "通过多日计划逐步把建议上床时间拉回。",
    priority: "P3",
    condition: { any: ["circadianShiftHigh", "sleepDebtModerate"] },
    action: "bedtime",
    evidenceLevel: "moderate",
    references: ["Circadian rhythm recovery"]
  },
  {
    id: "R_RECOVERY_NAP",
    name: "恢复性午睡",
    description: "严重睡眠债且可午睡时，安排午后恢复性睡眠。",
    priority: "P3",
    condition: { all: ["severeDebt", "napAvailable"] },
    action: "nap",
    evidenceLevel: "moderate",
    references: ["Recovery sleep research"]
  },
  {
    id: "R_POWER_NAP",
    name: "功能性短睡",
    description: "高认知负荷时安排短睡，降低下午崩盘风险。",
    priority: "P2",
    condition: { all: ["cognitiveDemandHigh", "napAvailable"] },
    action: "nap",
    evidenceLevel: "strong",
    references: ["Sleep inertia research"]
  },
  {
    id: "R_CAFFEINE_SUPPORT",
    name: "上午咖啡因支持",
    description: "严重缺觉且需要保持功能时，只在上午允许咖啡因。",
    priority: "P2",
    condition: { all: ["cognitiveDemandHigh", "sleepPressureHigh"] },
    action: "caffeine",
    evidenceLevel: "moderate",
    references: ["Caffeine timing research"]
  },
  {
    id: "R_CAFFEINE_RESTRICTION",
    name: "下午咖啡因限制",
    description: "保护后续夜间睡眠，限制下午和晚间咖啡因。",
    priority: "P1",
    condition: { any: ["circadianShiftHigh", "sleepDebtModerate"] },
    action: "caffeine",
    evidenceLevel: "strong",
    references: ["Caffeine timing research"]
  },
  {
    id: "R_MORNING_LIGHT",
    name: "晨光锚定",
    description: "起床后 30 分钟内见自然光，帮助作息前移。",
    priority: "P1",
    condition: { any: ["circadianShiftHigh", "fixedWakeTime"] },
    action: "light",
    evidenceLevel: "strong",
    references: ["Circadian light exposure research"]
  },
  {
    id: "R_EVENING_NAP_RESTRICTION",
    name: "傍晚不补觉",
    description: "17:00 后不安排午睡，避免进一步推迟夜间入睡。",
    priority: "P1",
    condition: { any: ["circadianShiftHigh", "sleepDebtModerate"] },
    action: "nap",
    evidenceLevel: "moderate",
    references: ["Two-Process Model"]
  },
  {
    id: "R_SAFETY_WARNING",
    name: "疲劳风险提示",
    description: "连续清醒过久或严重缺觉时提示高风险操作风险。",
    priority: "P1",
    condition: { any: ["continuousWakeCritical", "severeDebt"] },
    action: "warning",
    evidenceLevel: "strong",
    references: ["Sleep restriction impairment research"]
  }
];
