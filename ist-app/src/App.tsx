import { useState, useCallback } from 'react';
import type { AppStep, ISTProject, SlideDesign } from './types';
import Step1MaterialInput from './components/steps/Step1MaterialInput';
import Step2StorylineSelect from './components/steps/Step2StorylineSelect';
import Step3SlideEditor from './components/steps/Step3SlideEditor';
import Step4ReviewExport from './components/steps/Step4ReviewExport';
import { analyzeMaterials, generateSlides, runQualityCheck, generateAppsScript } from './services/api';

const stepLabels: { key: AppStep; label: string }[] = [
  { key: 'input', label: '素材投入' },
  { key: 'storyline', label: 'ストーリーライン' },
  { key: 'slides', label: 'スライド編集' },
  { key: 'review', label: 'チェック & 出力' },
];

export default function App() {
  const [step, setStep] = useState<AppStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ISTProject>({
    materials: '',
    analysis: null,
    selectedPattern: null,
    slides: [],
    qualityCheck: null,
    appsScript: '',
  });

  const handleAnalyze = useCallback(async (materials: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeMaterials(materials);
      setProject((prev) => ({ ...prev, materials, analysis }));
      setStep('storyline');
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateSlides = useCallback(async () => {
    if (!project.selectedPattern || !project.analysis) return;
    setIsLoading(true);
    setError(null);
    try {
      const pattern = project.analysis.storylines.find((s) => s.id === project.selectedPattern);
      if (!pattern) throw new Error('パターンが見つかりません');
      const slides = await generateSlides(project.materials, project.selectedPattern, pattern.chapters);
      setProject((prev) => ({ ...prev, slides }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スライド生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [project.selectedPattern, project.analysis, project.materials]);

  const handleQualityCheck = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await runQualityCheck(project.slides);
      setProject((prev) => ({ ...prev, qualityCheck: result }));
    } catch (e) {
      setError(e instanceof Error ? e.message : '品質チェックに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [project.slides]);

  const handleGenerateScript = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const script = await generateAppsScript(project.slides);
      setProject((prev) => ({ ...prev, appsScript: script }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Apps Script生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [project.slides]);

  const handleUpdateSlide = useCallback((index: number, slide: SlideDesign) => {
    setProject((prev) => {
      const slides = [...prev.slides];
      slides[index] = slide;
      return { ...prev, slides };
    });
  }, []);

  const currentStepIndex = stepLabels.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-accent text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">IST作成ツール</h1>
          <span className="text-white/60 text-sm">Internal Strategic Template</span>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {stepLabels.map((s, i) => (
              <div key={s.key} className="flex items-center">
                {i > 0 && <div className={`w-8 h-0.5 mx-1 ${i <= currentStepIndex ? 'bg-accent2' : 'bg-gray-200'}`} />}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      i < currentStepIndex
                        ? 'bg-accent2 text-white'
                        : i === currentStepIndex
                        ? 'bg-accent text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-sm hidden sm:inline ${
                      i === currentStepIndex ? 'text-accent font-medium' : 'text-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">閉じる</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {step === 'input' && (
          <Step1MaterialInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {step === 'storyline' && project.analysis && (
          <Step2StorylineSelect
            analysis={project.analysis}
            selectedPattern={project.selectedPattern}
            onSelectPattern={(id) =>
              setProject((prev) => ({ ...prev, selectedPattern: id }))
            }
            onNext={() => setStep('slides')}
            onBack={() => setStep('input')}
          />
        )}

        {step === 'slides' && (
          <Step3SlideEditor
            slides={project.slides}
            isLoading={isLoading}
            onGenerateSlides={handleGenerateSlides}
            onUpdateSlide={handleUpdateSlide}
            onNext={() => setStep('review')}
            onBack={() => setStep('storyline')}
          />
        )}

        {step === 'review' && (
          <Step4ReviewExport
            slides={project.slides}
            qualityCheck={project.qualityCheck}
            appsScript={project.appsScript}
            isLoading={isLoading}
            onRunQualityCheck={handleQualityCheck}
            onGenerateScript={handleGenerateScript}
            onBack={() => setStep('slides')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-muted">
          IST作成ツール &mdash; 士業向け戦略テンプレート生成
        </div>
      </footer>
    </div>
  );
}
