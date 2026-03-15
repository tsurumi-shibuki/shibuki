import type { StorylinePattern } from '../types';

export const storylinePatterns: StorylinePattern[] = [
  {
    id: 'A',
    name: '問題提起型',
    description: '現状の問題を提示し、危機感を醸成してから解決策を提示する構成',
    suitableFor: '競合に負けている・案件が来ない・依存構造からの脱却',
    chapters: [
      'Ch1: 現状の問題（業界・市場）',
      'Ch2: 読者自身が直面している課題',
      'Ch3: 放置するとどうなるか（数字）',
      'Ch4: 解決策の設計',
      'Ch5: 実行プロセス',
      'Ch6: 次の壁',
      'Ch7: 哲学的結論',
    ],
  },
  {
    id: 'B',
    name: '機会提示型',
    description: '市場の変化が生む新しい機会を提示し、具体的なスキームを展開する構成',
    suitableFor: '新規マーケット開拓・提携戦略・新サービス立上げ',
    chapters: [
      'Ch1: 市場の変化（確定した未来）',
      'Ch2: その変化が生む空白地帯',
      'Ch3: 先行事例・数字的優位性',
      'Ch4: 具体的スキーム',
      'Ch5: 営業・運用設計',
      'Ch6: スケールへの壁',
      'Ch7: 結論',
    ],
  },
  {
    id: 'C',
    name: 'フレームワーク提示型',
    description: '全体像を俯瞰し、体系的に知識を整理・移転する構成',
    suitableFor: '業務設計・仕組み構築・体系的な知識移転',
    chapters: [
      'Ch1: 全体像の俯瞰（地図を渡す）',
      'Ch2: 各要素の詳細設計',
      'Ch3: 実装の優先順位',
      'Ch4: 判断基準の提示',
      'Ch5: よくある失敗と回避策',
      'Ch6: 応用・発展',
      'Ch7: 結論',
    ],
  },
];
