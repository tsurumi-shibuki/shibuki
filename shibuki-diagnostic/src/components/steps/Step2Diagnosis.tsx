import { useEffect, useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import type { DiagnosticScore, DiagnosisResult, OfficeInfo } from '../../types';
import { QUESTION_CATEGORIES } from '../../data/questions';
import {
  toRadarData, getGradeColor, getGradeBg, getGradeEmoji, getGradeMessage, getScoreBarColor, INDUSTRY_BENCHMARKS,
} from '../../utils/scoring';

interface Props {
  scores: DiagnosticScore;
  diagnosis: DiagnosisResult | null;
  officeInfo: OfficeInfo;
  isLoading: boolean;
  error: string | null;
  onProceed: () => void;
}

export default function Step2Diagnosis({ scores, diagnosis, officeInfo, isLoading, error, onProceed }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>('strengths');
  const radarData = toRadarData(scores);

  const gradeColor = getGradeColor(scores.grade);
  const gradeBg = getGradeBg(scores.grade);

  // Animated counter for overall score
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let frame: number;
    const target = scores.overall;
    const step = () => {
      setDisplayScore((prev) => {
        if (prev >= target) return target;
        frame = requestAnimationFrame(step);
        return Math.min(prev + 2, target);
      });
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [scores.overall]);

  const toggle = (key: string) => setExpandedSection(expandedSection === key ? null : key);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ─── Overall Score Card ────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 border-2 text-center animate-fade-in"
        style={{ backgroundColor: gradeBg, borderColor: gradeColor + '40' }}
      >
        <p className="text-sm font-medium text-gray-600 mb-2">{officeInfo.name} 様の総合スコア</p>
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="text-6xl font-extrabold tabular-nums" style={{ color: gradeColor }}>
            {displayScore}
          </span>
          <div className="text-left">
            <p className="text-lg text-gray-400 font-medium">/ 100</p>
            <div
              className="text-2xl font-black px-3 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: gradeColor, color: '#fff' }}
            >
              {getGradeEmoji(scores.grade)} {scores.grade}ランク
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold" style={{ color: gradeColor }}>
          {scores.rankLabel}
        </p>
        <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
          {getGradeMessage(scores.grade)}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          全{scores.totalQuestions}問中 {scores.totalYes}問「はい」
        </p>
      </div>

      {/* ─── Radar Chart ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-slide-up">
        <h3 className="text-base font-bold text-gray-900 mb-4">カテゴリ別レーダーチャート</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'Noto Sans JP' }}
              />
              <Radar
                name="業界平均"
                dataKey="benchmark"
                stroke="#d1d5db"
                fill="#d1d5db"
                fillOpacity={0.2}
                strokeDasharray="4 2"
              />
              <Radar
                name="あなたの事務所"
                dataKey="score"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>
                )}
              />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Category Score Bars ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-slide-up">
        <h3 className="text-base font-bold text-gray-900 mb-4">カテゴリ別スコア詳細</h3>
        <div className="space-y-4">
          {QUESTION_CATEGORIES.map((cat) => {
            const catScore = scores.categories[cat.key];
            const benchmark = INDUSTRY_BENCHMARKS[cat.key];
            return (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">業界平均 {benchmark}%</span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: getScoreBarColor(catScore.score) }}
                    >
                      {catScore.score}%
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getGradeColor(catScore.grade) }}
                    >
                      {catScore.grade}
                    </span>
                  </div>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-3">
                  {/* Benchmark line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                    style={{ left: `${benchmark}%` }}
                    title={`業界平均: ${benchmark}%`}
                  />
                  {/* Score bar */}
                  <div
                    className="h-3 rounded-full transition-all duration-1000"
                    style={{
                      width: `${catScore.score}%`,
                      backgroundColor: getScoreBarColor(catScore.score),
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {catScore.yesCount} / {catScore.total} 項目達成
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── AI Diagnosis ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🤖</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">AIが診断中...</p>
              <p className="text-sm text-gray-500 mt-1">
                回答データを分析し、パーソナライズされた診断レポートを作成しています
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="text-red-700 font-medium">診断生成エラー</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {diagnosis && !isLoading && (
        <>
          {/* Overall Assessment */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 mb-3">総合評価</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{diagnosis.overallAssessment}</p>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up">
            <button
              onClick={() => toggle('strengths')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">強み（トップ3）</h3>
              </div>
              {expandedSection === 'strengths' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === 'strengths' && (
              <div className="px-5 pb-5 space-y-3">
                {diagnosis.strengths.map((s, i) => (
                  <div key={i} className="flex gap-3 bg-green-50 rounded-xl p-4">
                    <span className="text-green-500 font-bold text-sm flex-shrink-0">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up">
            <button
              onClick={() => toggle('improvements')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-orange-500" size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">改善課題（トップ3）</h3>
              </div>
              {expandedSection === 'improvements' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === 'improvements' && (
              <div className="px-5 pb-5 space-y-3">
                {diagnosis.improvements.map((imp, i) => {
                  const priority = imp.priority === 'high' ? { label: '高', color: '#dc2626', bg: '#fef2f2' } :
                    imp.priority === 'medium' ? { label: '中', color: '#d97706', bg: '#fffbeb' } :
                    { label: '低', color: '#6b7280', bg: '#f9fafb' };
                  return (
                    <div key={i} className="flex gap-3 rounded-xl p-4" style={{ backgroundColor: priority.bg }}>
                      <div className="flex-shrink-0">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: priority.color }}
                        >
                          優先度{priority.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{imp.title}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{imp.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up">
            <button
              onClick={() => toggle('action')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">アクションプラン</h3>
              </div>
              {expandedSection === 'action' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === 'action' && (
              <div className="px-5 pb-5 space-y-4">
                {/* Immediate */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-500 text-white rounded-full">
                      今すぐ（30日以内）
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {diagnosis.actionPlan.immediate.map((action, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-red-400 font-bold flex-shrink-0">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Short-term */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-orange-400 text-white rounded-full">
                      短期（3ヶ月以内）
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {diagnosis.actionPlan.shortTerm.map((action, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-orange-400 font-bold flex-shrink-0">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Long-term */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-500 text-white rounded-full">
                      中長期（1年以内）
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {diagnosis.actionPlan.longTerm.map((action, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-blue-400 font-bold flex-shrink-0">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Benchmark */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 animate-slide-up">
            <div className="flex gap-3">
              <AlertCircle className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">業界ベンチマーク比較</p>
                <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.benchmarkComment}</p>
              </div>
            </div>
          </div>

          {/* Closing */}
          <div
            className="rounded-2xl p-5 animate-slide-up"
            style={{ backgroundColor: gradeBg, borderColor: gradeColor + '40' }}
          >
            <p className="text-sm text-gray-700 leading-relaxed italic">{diagnosis.closingMessage}</p>
          </div>
        </>
      )}

      {/* ─── Proceed CTA ──────────────────────────────────────────── */}
      {(diagnosis || error) && !isLoading && (
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-6 text-center text-white animate-slide-up">
          <p className="font-bold text-lg mb-1">診断レポートをダウンロードして、面談を予約しませんか？</p>
          <p className="text-brand-200 text-sm mb-4">
            専門コンサルタントが診断結果をもとに、御社に最適な成長戦略をご提案します
          </p>
          <button
            onClick={onProceed}
            className="bg-white text-brand-600 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-md"
          >
            レポートDL・面談予約へ →
          </button>
        </div>
      )}
    </div>
  );
}
