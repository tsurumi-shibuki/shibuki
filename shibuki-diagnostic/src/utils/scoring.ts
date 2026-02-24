import type { Answers, CategoryKey, CategoryScore, DiagnosticScore, ScoreGrade } from '../types';
import { QUESTION_CATEGORIES, TOTAL_QUESTIONS } from '../data/questions';

// ─── スコアからグレードを計算 ────────────────────────────────────────────────
function getGrade(score: number): ScoreGrade {
  if (score >= 80) return 'S';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  if (score >= 20) return 'C';
  return 'D';
}

// ─── グレードのラベル ────────────────────────────────────────────────────────
export function getGradeLabel(grade: ScoreGrade): string {
  const labels: Record<ScoreGrade, string> = {
    S: '優良（業界上位20%）',
    A: '良好（業界上位40%）',
    B: '標準（業界平均水準）',
    C: '要改善（業界下位40%）',
    D: '要緊急対応（業界下位20%）',
  };
  return labels[grade];
}

export function getGradeColor(grade: ScoreGrade): string {
  const colors: Record<ScoreGrade, string> = {
    S: '#2563eb',
    A: '#059669',
    B: '#d97706',
    C: '#ea580c',
    D: '#dc2626',
  };
  return colors[grade];
}

export function getGradeBg(grade: ScoreGrade): string {
  const bgs: Record<ScoreGrade, string> = {
    S: '#eff6ff',
    A: '#f0fdf4',
    B: '#fffbeb',
    C: '#fff7ed',
    D: '#fef2f2',
  };
  return bgs[grade];
}

export function getGradeEmoji(grade: ScoreGrade): string {
  const emojis: Record<ScoreGrade, string> = {
    S: '🏆',
    A: '⭐',
    B: '📊',
    C: '⚠️',
    D: '🚨',
  };
  return emojis[grade];
}

// ─── 業界ベンチマーク（参考値：税理士業界推定平均）─────────────────────────
// YES/NO方式の達成率 (0–100%)
export const INDUSTRY_BENCHMARKS: Record<CategoryKey, number> = {
  goal:     30,
  bizmodel: 45,
  channel:  40,
  nurture:  25,
  sales:    35,
};

// ─── メインのスコア計算関数 ────────────────────────────────────────────────────
export function calculateScores(answers: Answers): DiagnosticScore {
  const categoryScores: Record<CategoryKey, CategoryScore> = {} as Record<CategoryKey, CategoryScore>;

  let totalYes = 0;

  for (const category of QUESTION_CATEGORIES) {
    const questionIds = category.questions.map((q) => q.id);
    const yesCount = questionIds.reduce((sum, id) => sum + (answers[id] ?? 0), 0);
    const total = questionIds.length;
    const score = Math.round((yesCount / total) * 100);
    const grade = getGrade(score);

    categoryScores[category.key] = {
      key: category.key,
      label: category.label,
      yesCount,
      total,
      score,
      grade,
    };

    totalYes += yesCount;
  }

  const overall = Math.round((totalYes / TOTAL_QUESTIONS) * 100);
  const grade = getGrade(overall);

  return {
    overall,
    categories: categoryScores,
    grade,
    rankLabel: getGradeLabel(grade),
    totalYes,
    totalQuestions: TOTAL_QUESTIONS,
  };
}

// ─── 完了率の計算 ─────────────────────────────────────────────────────────────
export function getAnsweredCount(answers: Answers): number {
  return Object.keys(answers).length;
}

export function getCompletionRate(answers: Answers): number {
  return Math.round((getAnsweredCount(answers) / TOTAL_QUESTIONS) * 100);
}

// ─── カテゴリ別の回答完了チェック ─────────────────────────────────────────────
export function isCategoryComplete(categoryKey: CategoryKey, answers: Answers): boolean {
  const cat = QUESTION_CATEGORIES.find((c) => c.key === categoryKey);
  if (!cat) return false;
  return cat.questions.every((q) => q.id in answers);
}

// ─── レーダーチャート用データ変換 ─────────────────────────────────────────────
export function toRadarData(scores: DiagnosticScore) {
  return QUESTION_CATEGORIES.map((cat) => ({
    category: cat.label,
    score: scores.categories[cat.key].score,
    benchmark: INDUSTRY_BENCHMARKS[cat.key],
    fullMark: 100,
    icon: cat.icon,
  }));
}

// ─── スコアバー色 ─────────────────────────────────────────────────────────────
export function getScoreBarColor(score: number): string {
  if (score >= 80) return '#2563eb';
  if (score >= 60) return '#059669';
  if (score >= 40) return '#d97706';
  if (score >= 20) return '#ea580c';
  return '#dc2626';
}

// ─── ランク別メッセージ ────────────────────────────────────────────────────────
export function getGradeMessage(grade: ScoreGrade): string {
  const messages: Record<ScoreGrade, string> = {
    S: '素晴らしい経営力です。さらなる高みへ向けた戦略を一緒に考えましょう。',
    A: '良好な経営状態です。いくつかの改善点で一気に飛躍できる可能性があります。',
    B: '業界平均水準です。強みを伸ばし、課題を一つずつ解消することで成長できます。',
    C: '改善が必要な項目が複数あります。優先順位を決めて、着実に取り組みましょう。',
    D: '早急な対応が必要です。まずは緊急度の高い課題から一緒に解決していきましょう。',
  };
  return messages[grade];
}
