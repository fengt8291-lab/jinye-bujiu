export type RecoveryLevel = "正常恢复" | "轻度透支" | "中度透支" | "重度透支";

export type RecoveryStage =
  | "NORMAL"
  | "MILD_SLEEP_DEBT"
  | "MODERATE_SLEEP_DEBT"
  | "SEVERE_SLEEP_DEBT"
  | "CIRCADIAN_SHIFT"
  | "RECOVERY_PHASE"
  | "STABLE";

export type RecoveryTrajectory =
  | "STABILIZE"
  | "GRADUAL_ADVANCE"
  | "DEBT_RECOVERY"
  | "COGNITIVE_PROTECTION"
  | "MIXED";

export type RulePriority = "P1" | "P2" | "P3" | "P4";
export type EvidenceLevel = "strong" | "moderate" | "practical";

export type TimeWindow = {
  start: string;
  end: string;
};

export type RecoveryEngineInput = {
  sleepStart: string;
  wakeTime: string;
  energy: number;
  todayImportant: boolean;
  todayImportantTime?: string;
  tomorrowEarlyClass: boolean;
  tomorrowClassTime?: string;
  tomorrowBrainLoad: boolean;
  targetWakeTime?: string;
  canNapToday: boolean;
  canNapTomorrow: boolean;
  napWindow?: TimeWindow;
  canExercise: boolean;
  exerciseWindow?: TimeWindow;
  dormPowerOff?: TimeWindow;
  mustStayUp: boolean;
  mustStayUpUntil?: string;
  fixedWakeTime: boolean;
};

export type NormalizedInput = RecoveryEngineInput & {
  sleepStartMinutes: number;
  wakeTimeMinutes: number;
  sleepDurationMinutes: number;
  sleepHours: number;
  requiredWakeTime: string;
  requiredWakeMinutes: number;
  napWindow: TimeWindow;
  exerciseWindow: TimeWindow;
};

export type StateMetrics = {
  sleepDebtMinutes: number;
  continuousWakeHours: number;
  currentSleepMidpoint: number;
  baselineMidpoint: number;
  circadianShiftMinutes: number;
  sleepPressureLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  cognitiveRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
};

export type RecoveryState = {
  level: RecoveryLevel;
  stage: RecoveryStage;
  severity: number;
  trajectory: RecoveryTrajectory;
  metrics: StateMetrics;
};

export type RuleCondition = {
  all?: string[];
  any?: string[];
};

export type RuleAction =
  | "wakeTime"
  | "bedtime"
  | "nap"
  | "caffeine"
  | "light"
  | "movement"
  | "warning";

export type RecoveryRule = {
  id: string;
  name: string;
  description: string;
  priority: RulePriority;
  condition: RuleCondition;
  action: RuleAction;
  evidenceLevel: EvidenceLevel;
  references: string[];
};

export type TriggeredRule = RecoveryRule & {
  reason: string;
};

export type RecoveryScores = {
  sleepDebtScore: number;
  circadianScore: number;
  cognitiveRiskScore: number;
  recoveryMomentum: number;
  overallRecoveryScore: number;
  momentumLabel: "向上恢复" | "保持稳定" | "需要止损";
};

export type DailyRecoveryPlan = {
  day: number;
  headline: string;
  wakeTime: string;
  bedtime: string;
  nap: string;
  caffeine: string;
  tea: string;
  light: string;
  exercise: string;
  goal: string;
  warnings: string[];
  anchors: Array<{
    time: string;
    label: string;
  }>;
};

export type RecoveryPlan = {
  level: RecoveryLevel;
  stage: RecoveryStage;
  stageLabel: string;
  stageBrief: string;
  trajectory: RecoveryTrajectory;
  score: number;
  scores: RecoveryScores;
  sleepHours: number;
  sleepDebt: string;
  risk: string;
  targetLine: string;
  rules: TriggeredRule[];
  timeline: DailyRecoveryPlan[];
};
