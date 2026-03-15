export interface MaterialAnalysis {
  usableInfo: string[];
  missingInfo: string[];
  storylines: StorylinePattern[];
}

export interface StorylinePattern {
  id: 'A' | 'B' | 'C';
  name: string;
  description: string;
  suitableFor: string;
  chapters: string[];
}

export type LayoutType = 'bullet' | 'comparison' | 'flow' | 'box' | 'highlight';

export interface SlideDesign {
  pageNumber: number;
  title: string;
  layout: LayoutType;
  mainVisual: string;
  insight: string;
  content: string;
  needsReview: boolean;
}

export interface QualityCheckResult {
  passed: string[];
  issues: QualityIssue[];
}

export interface QualityIssue {
  slideNumber: number;
  problem: string;
  suggestion: string;
}

export interface ISTProject {
  materials: string;
  analysis: MaterialAnalysis | null;
  selectedPattern: 'A' | 'B' | 'C' | null;
  slides: SlideDesign[];
  qualityCheck: QualityCheckResult | null;
  appsScript: string;
}

export type AppStep = 'input' | 'storyline' | 'slides' | 'review' | 'export';
