import { useState } from 'react';
import { FileText, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onAnalyze: (materials: string) => Promise<void>;
  isLoading: boolean;
}

export default function Step1MaterialInput({ onAnalyze, isLoading }: Props) {
  const [materials, setMaterials] = useState('');

  const handleSubmit = () => {
    if (materials.trim()) {
      onAnalyze(materials);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-light mb-4">
          <FileText className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-accent mb-2">STEP 1：素材投入</h2>
        <p className="text-muted">
          IST化したい素材（テキスト・メモ・URL等）を貼り付けてください
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <textarea
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          placeholder={`ここに素材を貼り付けてください。

例：
- セミナー原稿やメモ
- ブログ記事やコラム
- 業界統計や調査データ
- 参考URLなど

複数の素材をまとめて投入できます。`}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-y
                     focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent
                     text-base leading-relaxed placeholder:text-gray-400"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Upload className="w-4 h-4" />
            <span>{materials.length.toLocaleString()} 文字</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!materials.trim() || isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white
                       rounded-lg font-medium hover:bg-accent/90 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                素材を解析する
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
