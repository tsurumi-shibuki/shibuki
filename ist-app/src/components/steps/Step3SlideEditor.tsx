import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Layout,
  Type,
  Lightbulb,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import type { SlideDesign, LayoutType } from '../../types';

interface Props {
  slides: SlideDesign[];
  isLoading: boolean;
  onGenerateSlides: () => Promise<void>;
  onUpdateSlide: (index: number, slide: SlideDesign) => void;
  onNext: () => void;
  onBack: () => void;
}

const layoutLabels: Record<LayoutType, string> = {
  bullet: '箇条書き',
  comparison: '比較表',
  flow: 'フロー図',
  box: 'ボックス分割',
  highlight: '数値ハイライト',
};

const layoutIcons: Record<LayoutType, string> = {
  bullet: '•',
  comparison: '⇔',
  flow: '→',
  box: '□',
  highlight: '#',
};

export default function Step3SlideEditor({
  slides,
  isLoading,
  onGenerateSlides,
  onUpdateSlide,
  onNext,
  onBack,
}: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);

  if (slides.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-accent mb-2">STEP 3：スライド生成</h2>
          <p className="text-muted">選択したストーリーラインに基づいてスライドを生成します</p>
        </div>

        <button
          onClick={onGenerateSlides}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white
                     rounded-lg font-medium hover:bg-accent/90 transition-colors text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              スライド生成中...
            </>
          ) : (
            <>
              <Layout className="w-6 h-6" />
              スライドを生成する
            </>
          )}
        </button>

        <div className="mt-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ストーリーライン選択に戻る
          </button>
        </div>
      </motion.div>
    );
  }

  const slide = slides[currentSlide];

  const handleFieldEdit = (field: keyof SlideDesign, value: string) => {
    onUpdateSlide(currentSlide, { ...slide, [field]: value });
    setEditingField(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-accent mb-2">STEP 3：スライド編集</h2>
        <p className="text-muted">
          各スライドの内容を確認・編集してください（{slides.length}枚）
        </p>
      </div>

      {/* Slide Navigation */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                i === currentSlide
                  ? 'bg-accent text-white'
                  : s.needsReview
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.pageNumber}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Preview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        {/* Slide Header */}
        <div className="bg-accent px-6 py-3 flex items-center justify-between">
          <span className="text-white/80 text-sm">P{slide.pageNumber}</span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              slide.needsReview
                ? 'bg-amber-400/20 text-amber-100'
                : 'bg-green-400/20 text-green-100'
            }`}>
              {slide.needsReview ? (
                <><AlertCircle className="w-3 h-3" /> 要確認</>
              ) : '確認済み'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white text-xs">
              {layoutIcons[slide.layout]} {layoutLabels[slide.layout]}
            </span>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-8 min-h-[320px]" style={{ aspectRatio: '16/9', maxHeight: '480px' }}>
          {/* Title */}
          <div className="mb-6">
            {editingField === 'title' ? (
              <input
                autoFocus
                defaultValue={slide.title}
                onBlur={(e) => handleFieldEdit('title', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFieldEdit('title', e.currentTarget.value);
                }}
                className="w-full text-2xl font-bold text-accent border-b-2 border-accent2 outline-none pb-1"
              />
            ) : (
              <h3
                onClick={() => setEditingField('title')}
                className="text-2xl font-bold text-accent cursor-pointer hover:bg-light/50 rounded px-2 py-1 -mx-2 flex items-center gap-2 group"
              >
                <Type className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100" />
                {slide.title}
                <Edit3 className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 ml-auto" />
              </h3>
            )}
          </div>

          {/* Content */}
          <div className="mb-6">
            {editingField === 'content' ? (
              <textarea
                autoFocus
                defaultValue={slide.content}
                onBlur={(e) => handleFieldEdit('content', e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent2 text-sm resize-y"
              />
            ) : (
              <div
                onClick={() => setEditingField('content')}
                className="text-sm text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-light/30 rounded p-3 -mx-3 group"
              >
                <Edit3 className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 float-right" />
                {slide.content || '（クリックして内容を編集）'}
              </div>
            )}
          </div>

          {/* Visual description */}
          {slide.mainVisual && (
            <div className="bg-light rounded-lg p-3 mb-4 text-sm text-accent2">
              <span className="font-medium">ビジュアル：</span>{slide.mainVisual}
            </div>
          )}

          {/* Insight */}
          <div className="border-t border-gray-200 pt-3">
            {editingField === 'insight' ? (
              <input
                autoFocus
                defaultValue={slide.insight}
                onBlur={(e) => handleFieldEdit('insight', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFieldEdit('insight', e.currentTarget.value);
                }}
                className="w-full text-sm border-b border-accent2 outline-none pb-1"
              />
            ) : (
              <p
                onClick={() => setEditingField('insight')}
                className="text-sm text-accent2 cursor-pointer hover:bg-light/30 rounded px-2 py-1 -mx-2 flex items-center gap-1 group"
              >
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>▶ {slide.insight}</span>
                <Edit3 className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 ml-auto shrink-0" />
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-muted
                     hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ストーリーライン選択に戻る
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white
                     rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          品質チェックへ
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
