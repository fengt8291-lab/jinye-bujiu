# 今夜补救恢复调度算法 v1

本文档对应本地规则引擎 `lib/recovery-engine`，用于说明「今夜补救」如何从用户输入生成 4-5 天恢复调度计划。

## 1. 引擎目标

系统不是睡眠记录器，也不是健康打卡工具。引擎目标是：

- 在现实约束下恢复认知功能和作息稳定性。
- 优先固定起床点，而不是强迫用户暴力早睡。
- 连续 4-5 天渐进恢复，而不是一次性补觉。
- 所有建议必须可解释、可追溯、可稳定复现。

## 2. 执行链路

```text
RecoveryEngineInput
-> normalizeInput()
-> evaluateStateMetrics()
-> evaluateRecoveryState()
-> evaluateRules()
-> resolveConflicts()
-> calculateScores()
-> buildMultiDayPlan()
-> RecoveryPlan
```

## 3. 输入标准化

`RecoveryEngineInput` 接收页面表单数据：

- 昨晚入睡时间、今天起床时间、精神状态。
- 今天重要事项、明天早课、明天高强度用脑。
- 目标起床时间、午睡窗口、运动窗口。
- 宿舍断电时段、最近是否必须熬夜。

`normalizeInput()` 会做三件事：

- 把所有时间转成分钟。
- 给缺省约束填入安全默认值。
- 处理跨午夜时间，例如 `02:30` 会被视为次日凌晨。

默认值：

- 午睡窗口：`13:00-14:00`
- 运动窗口：`18:00-20:00`
- 明天早课时间：`08:00`
- 目标起床时间：默认沿用今天起床时间

## 4. 状态评估

`evaluateStateMetrics()` 计算核心状态变量：

- `sleepDebtMinutes`：推荐 7.5h 与实际睡眠的差值。
- `continuousWakeHours`：估算连续清醒压力。
- `circadianShiftMinutes`：当前睡眠中点相对目标睡眠中点的后移程度。
- `sleepPressureLevel`：LOW / MODERATE / HIGH / CRITICAL。
- `cognitiveRisk`：LOW / MODERATE / HIGH / CRITICAL。

状态不是为了吓用户，而是为了决定恢复强度。

## 5. 状态机

`evaluateRecoveryState()` 输出规范状态：

```text
NORMAL
MILD_SLEEP_DEBT
MODERATE_SLEEP_DEBT
SEVERE_SLEEP_DEBT
CIRCADIAN_SHIFT
RECOVERY_PHASE
STABLE
```

判定优先级：

```text
SEVERE_SLEEP_DEBT
> CIRCADIAN_SHIFT
> MODERATE_SLEEP_DEBT
> MILD_SLEEP_DEBT
> RECOVERY_PHASE
> NORMAL
> STABLE
```

当前 MVP 暂时用单次输入估算状态，后续接入历史记录后再判断连续 3 天趋势。

## 6. Rule DSL

规则位于 `rules.ts`。每条规则包含：

```ts
type RecoveryRule = {
  id: string;
  name: string;
  description: string;
  priority: "P1" | "P2" | "P3" | "P4";
  condition: RuleCondition;
  action: RuleAction;
  evidenceLevel: "strong" | "moderate" | "practical";
  references: string[];
};
```

当前核心规则：

- `R_WAKE_ANCHOR`：固定起床锚点。
- `R_NO_VIOLENT_EARLY_SLEEP`：避免暴力早睡。
- `R_GRADUAL_ADVANCE`：逐日回调建议上床时间。
- `R_RECOVERY_NAP`：严重睡眠债时安排恢复性午睡。
- `R_POWER_NAP`：高认知负荷时安排功能性短睡。
- `R_CAFFEINE_SUPPORT`：上午咖啡因支持。
- `R_CAFFEINE_RESTRICTION`：下午咖啡因限制。
- `R_MORNING_LIGHT`：晨光锚定。
- `R_EVENING_NAP_RESTRICTION`：傍晚不补觉。
- `R_SAFETY_WARNING`：疲劳风险提示。

## 7. 冲突解决

`resolveConflicts()` 按优先级处理冲突：

```text
P1 安全与作息保护
P2 认知保护
P3 睡眠债恢复
P4 舒适优化
```

示例：

- 必须熬夜与恢复作息冲突时，优先止损。
- 高认知负荷与保护夜间睡眠冲突时，只允许上午咖啡因。
- 不能午睡与严重睡眠债冲突时，改为 8 分钟闭眼恢复。
- 早课与睡够 8 小时冲突时，优先固定起床点。

## 8. 评分系统

`calculateScores()` 输出 5 个指标：

- `sleepDebtScore`：睡眠债越高，分数越低。
- `circadianScore`：作息后移越明显，分数越低。
- `cognitiveRiskScore`：精神状态差、重要安排、必须熬夜会降低分数。
- `recoveryMomentum`：固定起床提升动量，必须熬夜降低动量。
- `overallRecoveryScore`：综合恢复评分。

综合评分公式：

```text
overall =
  sleepDebtScore * 0.35
  + circadianScore * 0.30
  + recoveryMomentum * 0.20
  + cognitiveRiskScore * 0.15
```

## 9. 多日计划生成

`buildMultiDayPlan()` 默认输出 4 天。以下情况输出 5 天：

- 重度透支。
- MIXED 混合路径。
- 用户最近几天必须熬夜。

每日计划包含：

- 起床时间。
- 建议上床时间。
- 午睡或短休息。
- 咖啡因窗口。
- 茶建议。
- 光照建议。
- 运动安排。
- 风险提示。
- 4 个图形化时间锚点。

Day 逻辑：

```text
Day 1：先止损，保护白天功能。
Day 2：减少刺激，开始拉回作息。
Day 3：减少补偿，降低咖啡和午睡依赖。
Day 4-5：稳定固定起床点，接近目标作息。
```

## 10. 文案原则

页面展示不直接使用过多专业词。

替换规则：

- 节律漂移 -> 作息有点偏了
- 睡眠窗口 -> 建议上床时间
- 睡眠压力 -> 晚上更容易睡着
- 二次崩盘风险 -> 今晚别再加码
- Wake Anchor -> 固定起床点

## 11. 典型测试场景

- 默认输入：输出 4 天计划，状态为中轻度恢复路径。
- 睡眠 `<4h` + 精神 `<=4`：输出重度止损计划。
- 明天早课 `07:30`：起床时间锚定到 `07:30`。
- 不能午睡：午睡项改为闭眼短休息。
- 必须熬夜到 `01:30`：Day 1 不强行早睡，后续逐日回调。
- 宿舍断电 `23:30-06:00`：建议提前完成洗漱和收尾。
