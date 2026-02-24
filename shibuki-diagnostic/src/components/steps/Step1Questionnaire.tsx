import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, HelpCircle, Info } from 'lucide-react';
import type { OfficeInfo, Answers, CategoryKey } from '../../types';
import { QUESTION_CATEGORIES, TOTAL_QUESTIONS } from '../../data/questions';
import { getAnsweredCount } from '../../utils/scoring';

interface Props {
  officeInfo: OfficeInfo;
  answers: Answers;
  onOfficeInfoChange: (info: OfficeInfo) => void;
  onAnswer: (questionId: string, value: 0 | 1) => void;
  onComplete: () => void;
}

type SubStep = 'info' | CategoryKey;

const SUB_STEPS: SubStep[] = ['info', 'goal', 'bizmodel', 'channel', 'nurture', 'sales'];

export default function Step1Questionnaire({
  officeInfo,
  answers,
  onOfficeInfoChange,
  onAnswer,
  onComplete,
}: Props) {
  const [subStep, setSubStep] = useState<SubStep>('info');
  const [showHelp, setShowHelp] = useState<string | null>(null);

  const currentIndex = SUB_STEPS.indexOf(subStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === SUB_STEPS.length - 1;
  const currentCategory = QUESTION_CATEGORIES.find((c) => c.key === subStep);

  const answeredCount = getAnsweredCount(answers);
  const progressPercent = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  // ─── Info Section Validation ───────────────────────────────────────────
  const isInfoValid =
    officeInfo.name.trim() !== '' &&
    officeInfo.ownerName.trim() !== '' &&
    officeInfo.email.trim() !== '';

  // ─── Category completion check ────────────────────────────────────────
  const isCatAnswered = (catKey: CategoryKey) => {
    const cat = QUESTION_CATEGORIES.find((c) => c.key === catKey);
    if (!cat) return false;
    return cat.questions.every((q) => q.id in answers);
  };

  const canProceed = () => {
    if (subStep === 'info') return isInfoValid;
    return isCatAnswered(subStep as CategoryKey);
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (isLast) {
      onComplete();
    } else {
      setSubStep(SUB_STEPS[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setSubStep(SUB_STEPS[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSubStepLabel = (s: SubStep) => {
    if (s === 'info') return '事務所情報';
    const cat = QUESTION_CATEGORIES.find((c) => c.key === s);
    return cat?.label ?? s;
  };

  const getSubStepStatus = (s: SubStep, idx: number) => {
    const curr = currentIndex;
    if (idx < curr) return 'done';
    if (idx === curr) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* ─── Progress Header ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            回答済み: {answeredCount} / {TOTAL_QUESTIONS} 問
          </span>
          <span className="text-sm font-semibold text-brand-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ─── Sub-step Nav ─────────────────────────────────────────── */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {SUB_STEPS.map((s, idx) => {
          const status = getSubStepStatus(s, idx);
          const cat = QUESTION_CATEGORIES.find((c) => c.key === s);
          return (
            <button
              key={s}
              onClick={() => {
                // Allow backward nav freely; forward nav only if prev done
                if (idx < currentIndex || (idx === currentIndex + 1 && canProceed())) {
                  setSubStep(s);
                }
              }}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all
                ${status === 'active' ? 'bg-brand-500 text-white shadow-md' : ''}
                ${status === 'done' ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' : ''}
                ${status === 'pending' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-base">
                {status === 'done' ? '✓' : s === 'info' ? '📋' : cat?.icon}
              </span>
              <span className="leading-tight text-center">{getSubStepLabel(s)}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Info Section ─────────────────────────────────────────── */}
      {subStep === 'info' && (
        <div className="animate-slide-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">事務所基本情報</h2>
            <p className="text-sm text-gray-500 mb-6">
              診断レポートに記載される情報です。正確にご入力ください。
            </p>

            <div className="grid gap-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    事務所名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={officeInfo.name}
                    onChange={(e) => onOfficeInfoChange({ ...officeInfo, name: e.target.value })}
                    placeholder="○○税理士事務所"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    所長名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={officeInfo.ownerName}
                    onChange={(e) => onOfficeInfoChange({ ...officeInfo, ownerName: e.target.value })}
                    placeholder="山田 太郎"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    職員数（所長含む）
                  </label>
                  <select
                    value={officeInfo.staffCount}
                    onChange={(e) => onOfficeInfoChange({ ...officeInfo, staffCount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="1名（所長のみ）">1名（所長のみ）</option>
                    <option value="2〜3名">2〜3名</option>
                    <option value="4〜9名">4〜9名</option>
                    <option value="10〜19名">10〜19名</option>
                    <option value="20名以上">20名以上</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    開業年数
                  </label>
                  <select
                    value={officeInfo.yearsInBusiness}
                    onChange={(e) => onOfficeInfoChange({ ...officeInfo, yearsInBusiness: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="1年未満">1年未満</option>
                    <option value="1〜3年">1〜3年</option>
                    <option value="3〜5年">3〜5年</option>
                    <option value="5〜10年">5〜10年</option>
                    <option value="10〜20年">10〜20年</option>
                    <option value="20年以上">20年以上</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  主要サービス・得意分野
                </label>
                <input
                  type="text"
                  value={officeInfo.mainServices}
                  onChange={(e) => onOfficeInfoChange({ ...officeInfo, mainServices: e.target.value })}
                  placeholder="例：法人顧問・相続・医療系に特化"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={officeInfo.email}
                  onChange={(e) => onOfficeInfoChange({ ...officeInfo, email: e.target.value })}
                  placeholder="info@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  面談予約の確認メールの送付先です
                </p>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">診断について</p>
              <p>
                この診断は税理士事務所のマーケティング・営業力を5つの観点から評価します。
                各設問は「はい（〇）／いいえ（×）」の2択です。現状を正直にご回答ください。
                所要時間は約10〜15分です。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Category Questions ───────────────────────────────────── */}
      {subStep !== 'info' && currentCategory && (
        <div className="animate-slide-up">
          {/* Category Header */}
          <div
            className="rounded-2xl p-6 mb-6 border"
            style={{ backgroundColor: currentCategory.bgColor, borderColor: currentCategory.color + '30' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{currentCategory.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentCategory.label}</h2>
                <p className="text-sm text-gray-600">{currentCategory.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                {currentCategory.questions.map((q) => (
                  <div
                    key={q.id}
                    className={`w-6 h-1.5 rounded-full transition-colors ${
                      q.id in answers ? 'bg-current opacity-100' : 'bg-gray-300'
                    }`}
                    style={{ color: currentCategory.color }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {currentCategory.questions.filter((q) => q.id in answers).length} /
                {currentCategory.questions.length} 回答済み
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {currentCategory.questions.map((question, idx) => {
              const answered = question.id in answers;
              const value = answers[question.id];

              return (
                <div
                  key={question.id}
                  className={`bg-white rounded-2xl border p-5 transition-all ${
                    answered ? 'border-gray-200 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Question number */}
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: currentCategory.color }}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Question text */}
                      <div className="flex items-start gap-2 mb-3">
                        <p className="text-sm font-medium text-gray-800 leading-relaxed flex-1">
                          {question.text}
                        </p>
                        {question.helpText && (
                          <button
                            onClick={() =>
                              setShowHelp(showHelp === question.id ? null : question.id)
                            }
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                          >
                            <HelpCircle size={16} />
                          </button>
                        )}
                      </div>

                      {/* Help text */}
                      {showHelp === question.id && question.helpText && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {question.helpText}
                          </p>
                        </div>
                      )}

                      {/* YES/NO Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => onAnswer(question.id, 1)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                            answered && value === 1
                              ? 'bg-green-500 border-green-500 text-white shadow-sm scale-[1.02]'
                              : 'border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          {answered && value === 1 ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Circle size={16} />
                          )}
                          はい（〇）
                        </button>
                        <button
                          onClick={() => onAnswer(question.id, 0)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                            answered && value === 0
                              ? 'bg-red-400 border-red-400 text-white shadow-sm scale-[1.02]'
                              : 'border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          {answered && value === 0 ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Circle size={16} />
                          )}
                          いいえ（×）
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Navigation Buttons ───────────────────────────────────── */}
      <div className="flex gap-3 mt-8">
        {!isFirst && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
            戻る
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all ${
            canProceed()
              ? 'bg-brand-500 hover:bg-brand-600 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isLast ? (
            <>
              診断を開始する
              <CheckCircle2 size={18} />
            </>
          ) : (
            <>
              次へ
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {!canProceed() && subStep === 'info' && (
        <p className="text-center text-xs text-gray-400 mt-3">
          ※ 事務所名・所長名・メールアドレスは必須です
        </p>
      )}
      {!canProceed() && subStep !== 'info' && (
        <p className="text-center text-xs text-gray-400 mt-3">
          ※ すべての質問に回答してから次へ進めます
        </p>
      )}
    </div>
  );
}
