import type { MaterialAnalysis, SlideDesign, QualityCheckResult } from '../types';

const API_BASE = '/api';

export async function analyzeMaterials(materials: string): Promise<MaterialAnalysis> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materials }),
  });
  if (!res.ok) throw new Error('素材の解析に失敗しました');
  return res.json();
}

export async function generateSlides(
  materials: string,
  patternId: 'A' | 'B' | 'C',
  chapters: string[],
): Promise<SlideDesign[]> {
  const res = await fetch(`${API_BASE}/generate-slides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materials, patternId, chapters }),
  });
  if (!res.ok) throw new Error('スライド生成に失敗しました');
  return res.json();
}

export async function runQualityCheck(slides: SlideDesign[]): Promise<QualityCheckResult> {
  const res = await fetch(`${API_BASE}/quality-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slides }),
  });
  if (!res.ok) throw new Error('品質チェックに失敗しました');
  return res.json();
}

export async function generateAppsScript(slides: SlideDesign[]): Promise<string> {
  const res = await fetch(`${API_BASE}/generate-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slides }),
  });
  if (!res.ok) throw new Error('Apps Script生成に失敗しました');
  const data = await res.json();
  return data.script;
}
