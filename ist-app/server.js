import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `あなたはIST（Internal Strategic Template）作成の専門家です。
税理士・司法書士（開業3〜10年、規模10名程度）向けの本格的なスライド資料を設計します。

設計ルール：
- 1枚1メッセージ
- 見出し＝結論（問いかけNG）
- 本文3行以内→図・表・箇条書きで補完
- 略語は初出時に()補足
- 各枚末尾に▶で始まる示唆を入れる
- 読者より一段上の抽象度で整理。ただし置いてけぼりにしない

カラーパレット：
ACCENT = '#1A3A5C', ACCENT2 = '#2E7D9E', LIGHT = '#E8F4F8', TEXT = '#1A1A1A', MUTED = '#555555'

必ずJSON形式で回答してください。`;

// STEP 1: Analyze materials
app.post('/api/analyze', async (req, res) => {
  try {
    const { materials } = req.body;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下の素材を解析してください。

素材：
${materials}

以下のJSON形式で回答してください（JSONのみ、説明不要）：
{
  "usableInfo": ["使える情報1", "使える情報2", ...],
  "missingInfo": ["不足情報1", "不足情報2", ...],
  "storylines": [
    {
      "id": "A",
      "name": "問題提起型",
      "description": "この素材に対する問題提起型の具体的な構成説明",
      "suitableFor": "この素材で問題提起型が向いている理由",
      "chapters": ["Ch1: 具体的な章タイトル", "Ch2: ...", ...]
    },
    {
      "id": "B",
      "name": "機会提示型",
      "description": "この素材に対する機会提示型の具体的な構成説明",
      "suitableFor": "この素材で機会提示型が向いている理由",
      "chapters": ["Ch1: 具体的な章タイトル", "Ch2: ...", ...]
    },
    {
      "id": "C",
      "name": "フレームワーク提示型",
      "description": "この素材に対するフレームワーク提示型の具体的な構成説明",
      "suitableFor": "この素材でフレームワーク提示型が向いている理由",
      "chapters": ["Ch1: 具体的な章タイトル", "Ch2: ...", ...]
    }
  ]
}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    const analysis = JSON.parse(jsonMatch[0]);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: '素材の解析に失敗しました' });
  }
});

// STEP 3: Generate slides
app.post('/api/generate-slides', async (req, res) => {
  try {
    const { materials, patternId, chapters } = req.body;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下の素材とストーリーラインに基づいて、スライドを生成してください。

素材：
${materials}

ストーリーラインパターン：${patternId}
章構成：
${chapters.join('\n')}

固定ページ構成：
- P1：表紙
- P2：はじめに（①作成意図 ②対象読者の課題 ③業界動向と本資料で得られること）
- P3：目次
- P4以降：本編（各チャプターごとに1〜3枚）
- 最終ページ：CTA（裏表紙）

レイアウト自動判定ルール：
- 3要素以下の対比 → box
- 4要素以上の比較 → comparison
- 時系列・プロセス → flow
- 単一の強いメッセージ → highlight
- 複数の独立した要点 → bullet

以下のJSON配列形式で回答してください（JSONのみ、説明不要）：
[
  {
    "pageNumber": 1,
    "title": "スライドタイトル（結論形・15文字以内）",
    "layout": "bullet|comparison|flow|box|highlight",
    "mainVisual": "図解の構造を言語で定義",
    "insight": "行動または認識の変化を促す1文",
    "content": "スライドの本文内容（3行以内）",
    "needsReview": false
  },
  ...
]`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    const slides = JSON.parse(jsonMatch[0]);
    res.json(slides);
  } catch (error) {
    console.error('Slide generation error:', error);
    res.status(500).json({ error: 'スライド生成に失敗しました' });
  }
});

// STEP 4: Quality check
app.post('/api/quality-check', async (req, res) => {
  try {
    const { slides } = req.body;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下のスライドに対して品質チェックを実行してください。

スライド一覧：
${JSON.stringify(slides, null, 2)}

チェック項目：
1. 1枚1メッセージ：見出しが1文で言えるか
2. 結論ファースト：見出しが答えになっているか（問いかけになっていないか）
3. 読者の言葉：読者が使わない言葉が混入していないか
4. 数字の根拠：統計・比較数値に出典があるか
5. 行動導線：読了後の「次の一手」が明確か
6. 抽象と具体：概念→図解→「つまりあなたの事務所では」で着地しているか
7. 禁止表現：スタッフの主体性を損なう表現がないか
8. 法的リスク：非弁・非税理士行為に抵触する記述がないか

以下のJSON形式で回答してください（JSONのみ、説明不要）：
{
  "passed": ["クリアした項目1", "クリアした項目2", ...],
  "issues": [
    {
      "slideNumber": 1,
      "problem": "問題内容",
      "suggestion": "修正案"
    },
    ...
  ]
}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (error) {
    console.error('Quality check error:', error);
    res.status(500).json({ error: '品質チェックに失敗しました' });
  }
});

// STEP 5: Generate Apps Script
app.post('/api/generate-script', async (req, res) => {
  try {
    const { slides } = req.body;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下のスライドデータをGoogle Slidesに反映するApps Scriptコードを生成してください。

スライドデータ：
${JSON.stringify(slides, null, 2)}

要件：
- var統一（let/const不可）
- HEXカラーのみ使用
- Logger.log()のみ使用（console.log不可）
- 空文字ガード関数safeStr()を含める
- カラーパレット：ACCENT='#1A3A5C', ACCENT2='#2E7D9E', LIGHT='#E8F4F8', TEXT='#1A1A1A', MUTED='#555555'
- 新規プレゼンテーションを作成し、各スライドを追加
- レイアウトに応じた図形・テキスト配置

コードのみ出力してください（説明不要）。\`\`\`javascript と \`\`\` で囲んでください。`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const codeMatch = text.match(/```(?:javascript)?\s*([\s\S]*?)```/);
    const script = codeMatch ? codeMatch[1].trim() : text;
    res.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Apps Script生成に失敗しました' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`IST API server running on http://0.0.0.0:${PORT}`);
});
