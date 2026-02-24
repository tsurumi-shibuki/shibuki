import jsPDF from 'jspdf';
import type { DiagnosticScore, DiagnosisResult, OfficeInfo } from '../types';
import { QUESTION_CATEGORIES } from '../data/questions';
import { getGradeLabel, INDUSTRY_BENCHMARKS } from '../utils/scoring';

// ─── PDF Report Generator ──────────────────────────────────────────────────────
// Generates a professional Japanese diagnostic report PDF

export async function generatePDF(
  officeInfo: OfficeInfo,
  scores: DiagnosticScore,
  diagnosis: DiagnosisResult | null,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── Color helpers ──────────────────────────────────────────────────────
  const gradeColors: Record<string, [number, number, number]> = {
    S: [37, 99, 235],
    A: [5, 150, 105],
    B: [217, 119, 6],
    C: [234, 88, 12],
    D: [220, 38, 38],
  };
  const gradeRgb = gradeColors[scores.grade] ?? [100, 100, 100];

  // ─── Helper: add new page if needed ────────────────────────────────────
  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // ─── Helper: wrapped text ────────────────────────────────────────────────
  const addText = (
    text: string,
    fontSize: number,
    color: [number, number, number] = [50, 50, 50],
    align: 'left' | 'center' = 'left',
    maxWidth = contentW,
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineH = fontSize * 0.45;
    lines.forEach((line: string) => {
      ensureSpace(lineH + 2);
      if (align === 'center') {
        doc.text(line, pageW / 2, y, { align: 'center' });
      } else {
        doc.text(line, margin, y);
      }
      y += lineH + 1;
    });
    return y;
  };

  // ─── Helper: section divider ────────────────────────────────────────────
  const sectionDivider = (label: string, rgb: [number, number, number] = [37, 99, 235]) => {
    ensureSpace(12);
    doc.setFillColor(...rgb);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(label, margin + 4, y + 6);
    y += 13;
  };

  // ─── Helper: score bar ────────────────────────────────────────────────
  const scoreBar = (label: string, score: number, benchmark: number, rgb: [number, number, number]) => {
    ensureSpace(14);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, y);
    doc.setTextColor(...rgb);
    doc.text(`${score}%`, margin + contentW, y, { align: 'right' });
    y += 4;
    // BG bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(margin, y, contentW, 4, 1, 1, 'F');
    // Score bar
    doc.setFillColor(...rgb);
    doc.roundedRect(margin, y, (contentW * score) / 100, 4, 1, 1, 'F');
    // Benchmark marker
    const bmX = margin + (contentW * benchmark) / 100;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(bmX, y - 1, bmX, y + 5);
    y += 9;
  };

  // ══════════════════════════════════════════════════════════════════════
  // PAGE 1: Cover
  // ══════════════════════════════════════════════════════════════════════

  // Header band
  doc.setFillColor(...gradeRgb);
  doc.rect(0, 0, pageW, 55, 'F');

  // Title
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('税理士事務所 経営力診断レポート', pageW / 2, 22, { align: 'center' });
  doc.setFontSize(10);
  doc.text('士業DXナビ | マーケティング・営業力 総合診断', pageW / 2, 31, { align: 'center' });

  // Office name
  doc.setFontSize(13);
  doc.text(officeInfo.name, pageW / 2, 44, { align: 'center' });

  y = 68;

  // Score circle (text-based)
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('総合スコア', pageW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(42);
  doc.setTextColor(...gradeRgb);
  doc.text(`${scores.overall}`, pageW / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(12);
  doc.setTextColor(120, 120, 120);
  doc.text('/ 100', pageW / 2, y, { align: 'center' });
  y += 8;

  // Grade badge
  doc.setFillColor(...gradeRgb);
  doc.roundedRect(pageW / 2 - 20, y, 40, 10, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${scores.grade}ランク`, pageW / 2, y + 7, { align: 'center' });
  y += 16;

  // Rank label
  doc.setFontSize(9);
  doc.setTextColor(...gradeRgb);
  doc.text(getGradeLabel(scores.grade), pageW / 2, y, { align: 'center' });
  y += 10;

  // Info box
  const boxY = y;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, boxY, contentW, 32, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const infoItems = [
    ['事務所名', officeInfo.name],
    ['所長名', officeInfo.ownerName],
    ['職員数', officeInfo.staffCount || '—'],
    ['開業年数', officeInfo.yearsInBusiness || '—'],
    ['主要サービス', officeInfo.mainServices || '—'],
    ['診断日', new Date().toLocaleDateString('ja-JP')],
  ];
  let infoY = boxY + 6;
  infoItems.forEach(([label, value]) => {
    doc.setTextColor(120, 120, 120);
    doc.text(`${label}:`, margin + 3, infoY);
    doc.setTextColor(40, 40, 40);
    doc.text(value, margin + 35, infoY);
    infoY += 4.8;
  });
  y = boxY + 36;

  // Achievement note
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `全${scores.totalQuestions}項目中 ${scores.totalYes}項目達成（達成率: ${scores.overall}%）`,
    pageW / 2,
    y,
    { align: 'center' },
  );
  y += 14;

  // ══════════════════════════════════════════════════════════════════════
  // PAGE 2: Category Scores
  // ══════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = 20;

  sectionDivider('カテゴリ別スコア（業界平均との比較）', gradeRgb);

  // Legend
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('縦線 = 業界平均 / バー = 貴事務所スコア', margin, y);
  y += 7;

  const catRgbs: Record<string, [number, number, number]> = {
    goal:     [37, 99, 235],
    bizmodel: [124, 58, 237],
    channel:  [5, 150, 105],
    nurture:  [217, 119, 6],
    sales:    [220, 38, 38],
  };

  QUESTION_CATEGORIES.forEach((cat) => {
    const catScore = scores.categories[cat.key];
    const benchmark = INDUSTRY_BENCHMARKS[cat.key];
    scoreBar(
      `${cat.label}（${catScore.yesCount}/${catScore.total}項目達成）`,
      catScore.score,
      benchmark,
      catRgbs[cat.key] ?? [100, 100, 100],
    );
  });

  y += 8;

  // ── Diagnosis sections ─────────────────────────────────────────────
  if (diagnosis) {
    // Overall Assessment
    sectionDivider('総合評価');
    addText(diagnosis.overallAssessment, 9, [50, 50, 50]);
    y += 4;

    // Strengths
    sectionDivider('強み（トップ3）', [5, 150, 105]);
    diagnosis.strengths.forEach((s, i) => {
      ensureSpace(20);
      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105);
      doc.text(`▶ 強み${i + 1}: ${s.title}`, margin, y);
      y += 5;
      addText(s.description, 8.5, [60, 60, 60]);
      y += 3;
    });

    // Improvements
    sectionDivider('改善課題（トップ3）', [220, 38, 38]);
    diagnosis.improvements.forEach((imp, i) => {
      ensureSpace(20);
      const priorityLabel = imp.priority === 'high' ? '★優先度高' : imp.priority === 'medium' ? '◆優先度中' : '◇優先度低';
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.text(`${priorityLabel} 課題${i + 1}: ${imp.title}`, margin, y);
      y += 5;
      addText(imp.description, 8.5, [60, 60, 60]);
      y += 3;
    });

    // Action Plan
    sectionDivider('アクションプラン');

    const planSections: Array<{ label: string; items: string[]; rgb: [number, number, number] }> = [
      { label: '今すぐ着手（30日以内）', items: diagnosis.actionPlan.immediate, rgb: [220, 38, 38] },
      { label: '短期取組（3ヶ月以内）', items: diagnosis.actionPlan.shortTerm, rgb: [217, 119, 6] },
      { label: '中長期戦略（1年以内）', items: diagnosis.actionPlan.longTerm, rgb: [37, 99, 235] },
    ];

    planSections.forEach(({ label, items, rgb }) => {
      ensureSpace(8);
      doc.setFontSize(9);
      doc.setTextColor(...rgb);
      doc.text(`【${label}】`, margin, y);
      y += 5;
      items.forEach((action) => {
        ensureSpace(8);
        addText(`→ ${action}`, 8.5, [60, 60, 60]);
      });
      y += 4;
    });

    // Benchmark
    sectionDivider('業界ベンチマーク比較', [100, 100, 100]);
    addText(diagnosis.benchmarkComment, 9, [50, 50, 50]);
    y += 4;

    // Closing
    ensureSpace(20);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const closingLines = doc.splitTextToSize(diagnosis.closingMessage, contentW - 8);
    closingLines.forEach((line: string, i: number) => {
      doc.text(line, margin + 4, y + 6 + i * 5);
    });
    y += 22;
  }

  // ─── Footer ────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `本レポートは士業DXナビの経営力診断システムにより自動生成されました | ${new Date().toLocaleDateString('ja-JP')} | ${p}/${totalPages}ページ`,
      pageW / 2,
      pageH - 8,
      { align: 'center' },
    );
  }

  // ─── Save ────────────────────────────────────────────────────────
  const fileName = `経営力診断レポート_${officeInfo.name || '事務所'}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
