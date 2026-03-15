import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';
import type { QualityCheckResult, SlideDesign } from '../../types';

interface Props {
  slides: SlideDesign[];
  qualityCheck: QualityCheckResult | null;
  appsScript: string;
  isLoading: boolean;
  onRunQualityCheck: () => Promise<void>;
  onGenerateScript: () => Promise<void>;
  onBack: () => void;
}

export default function Step4ReviewExport({
  slides,
  qualityCheck,
  appsScript,
  isLoading,
  onRunQualityCheck,
  onGenerateScript,
  onBack,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'check' | 'script'>('check');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(appsScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-accent mb-2">STEP 4：品質チェック & エクスポート</h2>
        <p className="text-muted">
          品質チェックを実行し、Google Slides用のApps Scriptを生成します
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('check')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'check'
              ? 'bg-white text-accent shadow-sm'
              : 'text-muted hover:text-accent'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          品質チェック
        </button>
        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'script'
              ? 'bg-white text-accent shadow-sm'
              : 'text-muted hover:text-accent'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Apps Script
        </button>
      </div>

      {activeTab === 'check' && (
        <div className="animate-fade-in">
          {!qualityCheck ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">
                {slides.length}枚のスライドに対して品質チェックを実行します
              </p>
              <button
                onClick={onRunQualityCheck}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white
                           rounded-lg font-medium hover:bg-accent/90 transition-colors text-lg
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    チェック中...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-6 h-6" />
                    品質チェックを実行
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Passed Items */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-800">
                    全枚数クリア（{qualityCheck.passed.length}項目）
                  </h3>
                </div>
                <ul className="space-y-1">
                  {qualityCheck.passed.map((item, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Issues */}
              {qualityCheck.issues.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-800">
                      要修正（{qualityCheck.issues.length}箇所）
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {qualityCheck.issues.map((issue, i) => (
                      <li key={i} className="text-sm">
                        <p className="text-amber-800 font-medium">
                          スライド{issue.slideNumber}：{issue.problem}
                        </p>
                        <p className="text-amber-700 mt-1">
                          → {issue.suggestion}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {qualityCheck.issues.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-green-700 font-medium">
                    すべてのチェック項目をクリアしました！
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'script' && (
        <div className="animate-fade-in">
          {!appsScript ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">
                Google Slides用のApps Scriptコードを生成します
              </p>
              <button
                onClick={onGenerateScript}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white
                           rounded-lg font-medium hover:bg-accent/90 transition-colors text-lg
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Code2 className="w-6 h-6" />
                    Apps Scriptを生成
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                <span className="text-gray-400 text-sm">Google Apps Script</span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300
                             hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-green-400" /> コピー済み</>
                  ) : (
                    <><Copy className="w-4 h-4" /> コピー</>
                  )}
                </button>
              </div>
              <pre className="p-4 text-sm text-gray-300 overflow-x-auto max-h-96">
                <code>{appsScript}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-muted
                     hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          スライド編集に戻る
        </button>
      </div>
    </motion.div>
  );
}
