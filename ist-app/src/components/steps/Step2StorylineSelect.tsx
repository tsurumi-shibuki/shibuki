import { motion } from 'framer-motion';
import { CheckCircle2, Lightbulb, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import type { MaterialAnalysis, StorylinePattern } from '../../types';

interface Props {
  analysis: MaterialAnalysis;
  selectedPattern: 'A' | 'B' | 'C' | null;
  onSelectPattern: (id: 'A' | 'B' | 'C') => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2StorylineSelect({
  analysis,
  selectedPattern,
  onSelectPattern,
  onNext,
  onBack,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-accent mb-2">STEP 2：素材解析 & ストーリーライン選択</h2>
        <p className="text-muted">素材から抽出した情報とストーリーライン候補を確認してください</p>
      </div>

      {/* Analysis Results */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg">使える情報</h3>
          </div>
          <ul className="space-y-2">
            {analysis.usableInfo.map((info, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg">不足情報</h3>
          </div>
          <ul className="space-y-2">
            {analysis.missingInfo.map((info, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-muted">•</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Storyline Selection */}
      <h3 className="text-lg font-bold text-accent mb-4">ストーリーラインを選択</h3>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {analysis.storylines.map((pattern: StorylinePattern) => (
          <button
            key={pattern.id}
            onClick={() => onSelectPattern(pattern.id)}
            className={`text-left bg-white rounded-xl shadow-sm border-2 p-5 transition-all hover:shadow-md ${
              selectedPattern === pattern.id
                ? 'border-accent2 ring-2 ring-accent2/20'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                selectedPattern === pattern.id
                  ? 'bg-accent2 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {pattern.id}
              </span>
              <h4 className="font-bold">{pattern.name}</h4>
            </div>
            <p className="text-sm text-muted mb-3">{pattern.description}</p>
            <div className="text-xs text-accent2 font-medium mb-3">
              向いているテーマ：{pattern.suitableFor}
            </div>
            <ul className="space-y-1">
              {pattern.chapters.map((ch, i) => (
                <li key={i} className="text-xs text-muted">{ch}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-muted
                     hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          素材に戻る
        </button>
        <button
          onClick={onNext}
          disabled={!selectedPattern}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white
                     rounded-lg font-medium hover:bg-accent/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          スライド生成へ
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
