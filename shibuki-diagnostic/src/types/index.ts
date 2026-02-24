// ─── Office Information ────────────────────────────────────────────────────────
export interface OfficeInfo {
  name: string;
  ownerName: string;
  staffCount: string;
  yearsInBusiness: string;
  mainServices: string;
  email: string;
}

// ─── Questionnaire ─────────────────────────────────────────────────────────────
export type CategoryKey = 'goal' | 'bizmodel' | 'channel' | 'nurture' | 'sales';

export interface Question {
  id: string;
  category: CategoryKey;
  text: string;
  helpText?: string;
}

export interface QuestionCategory {
  key: CategoryKey;
  label: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  questions: Question[];
}

// ─── Answers & Scoring ────────────────────────────────────────────────────────
// 1 = YES / 0 = NO / undefined = unanswered
export type Answers = Record<string, 0 | 1>;

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  yesCount: number;   // number of YES answers
  total: number;      // total questions in category
  score: number;      // 0–100 (yesCount/total * 100)
  grade: ScoreGrade;
}

export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface DiagnosticScore {
  overall: number; // 0–100
  categories: Record<CategoryKey, CategoryScore>;
  grade: ScoreGrade;
  rankLabel: string;
  totalYes: number;
  totalQuestions: number;
}

// ─── AI Diagnosis ─────────────────────────────────────────────────────────────
export interface DiagnosisStrength {
  title: string;
  description: string;
}

export interface DiagnosisImprovement {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DiagnosisActionPlan {
  immediate: string[];  // 30 days
  shortTerm: string[];  // 3 months
  longTerm: string[];   // 1 year
}

export interface DiagnosisResult {
  overallAssessment: string;
  strengths: DiagnosisStrength[];
  improvements: DiagnosisImprovement[];
  actionPlan: DiagnosisActionPlan;
  benchmarkComment: string;
  closingMessage: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export interface BookingInfo {
  preferredDate: string;
  preferredTime: string;
  format: 'online' | 'inperson';
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface BookingConfirmation {
  success: boolean;
  confirmationNumber: string;
  message: string;
}

// ─── App State ────────────────────────────────────────────────────────────────
export type AppStep = 1 | 2 | 3;

export interface AppState {
  step: AppStep;
  officeInfo: OfficeInfo;
  answers: Answers;
  scores: DiagnosticScore | null;
  diagnosis: DiagnosisResult | null;
  booking: BookingConfirmation | null;
}
