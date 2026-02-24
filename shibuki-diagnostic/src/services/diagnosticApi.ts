import type { Answers, DiagnosisResult, BookingInfo, BookingConfirmation, OfficeInfo } from '../types';
import type { DiagnosticScore } from '../types';

const API_BASE = '/api';

// ─── AI診断生成 ────────────────────────────────────────────────────────────────
export async function generateDiagnosis(
  officeInfo: OfficeInfo,
  answers: Answers,
  scores: DiagnosticScore,
): Promise<DiagnosisResult> {
  const response = await fetch(`${API_BASE}/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officeInfo,
      answers,
      categoryScores: Object.fromEntries(
        Object.entries(scores.categories).map(([k, v]) => [k, v.score]),
      ),
      overallScore: scores.overall,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.diagnosis as DiagnosisResult;
}

// ─── 面談予約 ──────────────────────────────────────────────────────────────────
export async function submitBooking(
  booking: BookingInfo,
  officeInfo: OfficeInfo,
  overallScore: number,
): Promise<BookingConfirmation> {
  const response = await fetch(`${API_BASE}/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking, officeInfo, overallScore }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}
