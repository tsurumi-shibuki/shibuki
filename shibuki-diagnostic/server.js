import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3001'] }));
app.use(express.json({ limit: '10mb' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/client')));
}

// ─── Diagnostic Generation API ────────────────────────────────────────────────
app.post('/api/diagnose', async (req, res) => {
  const { officeInfo, answers, categoryScores, overallScore } = req.body;

  if (!answers || !categoryScores || overallScore === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const categoryLabels = {
    finance: '財務・収益性',
    clients: '顧客管理・マーケティング',
    hr: '人材・組織体制',
    digital: 'デジタル化・業務効率',
    strategy: '将来戦略・リスク管理',
  };

  const categoryDetails = Object.entries(categoryScores)
    .map(([key, score]) => `${categoryLabels[key]}: ${score}点/100点`)
    .join('\n');

  const rankLabel =
    overallScore >= 80 ? '優良（業界上位20%）' :
    overallScore >= 65 ? '良好（業界上位40%）' :
    overallScore >= 50 ? '標準（業界平均水準）' :
    overallScore >= 35 ? '要改善（業界下位40%）' :
                         '要緊急対応（業界下位20%）';

  const prompt = `あなたは税理士事務所の経営コンサルタントとして、以下の診断データをもとに、事務所向けの詳細な経営診断レポートを作成してください。

【事務所情報】
事務所名: ${officeInfo?.name || '（未入力）'}
所長名: ${officeInfo?.ownerName || '（未入力）'}
職員数: ${officeInfo?.staffCount || '（未入力）'}名
開業年数: ${officeInfo?.yearsInBusiness || '（未入力）'}年
主要業務: ${officeInfo?.mainServices || '（未入力）'}

【総合スコア】
${overallScore}点/100点（${rankLabel}）

【カテゴリ別スコア】
${categoryDetails}

【回答内容の特記事項】
${JSON.stringify(answers, null, 2)}

以下の構成で、具体的かつ実践的な診断レポートを作成してください。税理士事務所の実務に即した専門的な表現を使い、所長が「自分のことだ」と感じるリアルな内容にしてください。

出力はJSON形式で以下の構造にしてください：

{
  "overallAssessment": "事務所全体の経営状況についての総合評価（200字程度）。スコアと業界内の立ち位置を踏まえた客観的な評価。",
  "strengths": [
    {
      "title": "強み①のタイトル（15字以内）",
      "description": "具体的な強みの説明と、なぜそれが事務所の競争力につながるかの解説（100字程度）"
    },
    {
      "title": "強み②のタイトル",
      "description": "..."
    },
    {
      "title": "強み③のタイトル",
      "description": "..."
    }
  ],
  "improvements": [
    {
      "title": "課題①のタイトル（15字以内）",
      "description": "課題の説明と放置した場合のリスク（100字程度）",
      "priority": "high"
    },
    {
      "title": "課題②のタイトル",
      "description": "...",
      "priority": "medium"
    },
    {
      "title": "課題③のタイトル",
      "description": "...",
      "priority": "medium"
    }
  ],
  "actionPlan": {
    "immediate": [
      "今すぐ着手すべき具体的なアクション①（30日以内）",
      "今すぐ着手すべき具体的なアクション②（30日以内）",
      "今すぐ着手すべき具体的なアクション③（30日以内）"
    ],
    "shortTerm": [
      "短期的に取り組むべきアクション①（3ヶ月以内）",
      "短期的に取り組むべきアクション②（3ヶ月以内）",
      "短期的に取り組むべきアクション③（3ヶ月以内）"
    ],
    "longTerm": [
      "中長期的な戦略アクション①（1年以内）",
      "中長期的な戦略アクション②（1年以内）",
      "中長期的な戦略アクション③（1年以内）"
    ]
  },
  "benchmarkComment": "税理士業界全体のトレンドや競合状況を踏まえた、この事務所のポジショニングに関するコメント（150字程度）",
  "closingMessage": "所長への励ましと面談での深掘り期待を込めた締めのメッセージ（100字程度）"
}

必ずJSON形式のみで出力してください。余計な説明は不要です。`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const diagnosis = JSON.parse(jsonMatch[0]);
    res.json({ diagnosis });
  } catch (err) {
    console.error('Diagnosis error:', err);
    res.status(500).json({ error: err.message || 'Diagnosis generation failed' });
  }
});

// ─── Booking API ───────────────────────────────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  const { booking, officeInfo, overallScore } = req.body;

  // In a real system, this would integrate with a calendar service (e.g., Google Calendar, Cal.com).
  // For this prototype, we simulate a successful booking and return a confirmation number.
  const confirmationNumber = `TX-${Date.now().toString(36).toUpperCase()}`;

  console.log('Booking received:', {
    confirmation: confirmationNumber,
    office: officeInfo?.name,
    score: overallScore,
    booking,
  });

  res.json({
    success: true,
    confirmationNumber,
    message: `面談のご予約を承りました。確認番号: ${confirmationNumber}`,
  });
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/client', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 士業事務所 経営力診断サーバー起動`);
  console.log(`   Port: ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health\n`);
});
