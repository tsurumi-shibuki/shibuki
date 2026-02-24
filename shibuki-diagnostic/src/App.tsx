import { useState, useCallback } from 'react';
import type { AppStep, OfficeInfo, Answers, DiagnosticScore, DiagnosisResult, BookingConfirmation } from './types';
import { calculateScores } from './utils/scoring';
import { generateDiagnosis } from './services/diagnosticApi';
import { generatePDF } from './services/pdfService';
import Step1Questionnaire from './components/steps/Step1Questionnaire';
import Step2Diagnosis from './components/steps/Step2Diagnosis';
import Step3Download from './components/steps/Step3Download';
import { Building2, ChevronRight } from 'lucide-react';

const STEP_LABELS = ['回答', '診断結果', '面談予約・DL'];

const INITIAL_OFFICE_INFO: OfficeInfo = {
  name: '',
  ownerName: '',
  staffCount: '',
  yearsInBusiness: '',
  mainServices: '',
  email: '',
};

export default function App() {
  const [step, setStep] = useState<AppStep>(1);
  const [officeInfo, setOfficeInfo] = useState<OfficeInfo>(INITIAL_OFFICE_INFO);
  const [answers, setAnswers] = useState<Answers>({});
  const [scores, setScores] = useState<DiagnosticScore | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);

  // ─── Handle Answer ────────────────────────────────────────────────────
  const handleAnswer = useCallback((questionId: string, value: 0 | 1) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // ─── Questionnaire Complete → Generate Diagnosis ──────────────────────
  const handleQuestionnaireComplete = async () => {
    const calculatedScores = calculateScores(answers);
    setScores(calculatedScores);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Start AI diagnosis generation
    setDiagnosisLoading(true);
    setDiagnosisError(null);
    try {
      const result = await generateDiagnosis(officeInfo, answers, calculatedScores);
      setDiagnosis(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setDiagnosisError(`AI診断の生成に失敗しました: ${message}`);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // ─── Proceed to Step 3 ────────────────────────────────────────────────
  const handleProceedToStep3 = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Download PDF ─────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!scores) return;
    await generatePDF(officeInfo, scores, diagnosis);
  };

  // ─── Booking Complete ─────────────────────────────────────────────────
  const handleBookingComplete = (confirmation: BookingConfirmation) => {
    setBookingConfirmation(confirmation);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 leading-none">士業DXナビ</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">税理士事務所 経営力診断</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1">
              {STEP_LABELS.map((label, idx) => {
                const stepNum = (idx + 1) as AppStep;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={label} className="flex items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors
                        ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}
                      `}
                    >
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        isActive ? 'text-brand-600' : isDone ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                    {idx < STEP_LABELS.length - 1 && (
                      <ChevronRight size={12} className="text-gray-300 mx-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1 */}
        {step === 1 && (
          <>
            {/* Hero section */}
            <div className="text-center mb-8">
              <div className="inline-block bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-600 mb-3">
                税理士事務所専用 · 無料診断
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                あなたの事務所の<br className="sm:hidden" />
                <span className="text-brand-500">経営力</span>を診断する
              </h1>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                マーケティング・営業の5つの視点から、今の事務所の強みと課題を数値で見える化。
                AI が個別の改善提案を提供します。
              </p>
            </div>
            <Step1Questionnaire
              officeInfo={officeInfo}
              answers={answers}
              onOfficeInfoChange={setOfficeInfo}
              onAnswer={handleAnswer}
              onComplete={handleQuestionnaireComplete}
            />
          </>
        )}

        {/* Step 2 */}
        {step === 2 && scores && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">診断結果</h2>
              <p className="text-sm text-gray-500">
                AIが{officeInfo.name}の経営力を分析しました
              </p>
            </div>
            <Step2Diagnosis
              scores={scores}
              diagnosis={diagnosis}
              officeInfo={officeInfo}
              isLoading={diagnosisLoading}
              error={diagnosisError}
              onProceed={handleProceedToStep3}
            />
          </>
        )}

        {/* Step 3 */}
        {step === 3 && scores && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                面談予約 & レポートダウンロード
              </h2>
              <p className="text-sm text-gray-500">
                診断結果の詳細を専門家と一緒に読み解きましょう
              </p>
            </div>
            <Step3Download
              officeInfo={officeInfo}
              scores={scores}
              diagnosis={diagnosis}
              onDownload={handleDownload}
              onBookingComplete={handleBookingComplete}
              bookingConfirmation={bookingConfirmation}
            />
          </>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 mt-16 py-8 text-center">
        <p className="text-xs text-gray-400">
          © 2025 士業DXナビ | 税理士事務所 経営力診断ツール
        </p>
        <p className="text-xs text-gray-400 mt-1">
          本診断はAIによる自動分析です。具体的な経営判断は専門家にご相談ください。
        </p>
      </footer>
    </div>
  );
}
