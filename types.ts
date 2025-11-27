export interface SlideData {
  id: number;
  originalText: string[];
  generatedScript: string;
  isGenerating: boolean;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface ProcessingStats {
  totalSlides: number;
  processedSlides: number;
  estimatedTimeRemaining: number;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
  EXPORT = 'EXPORT'
}

export type TargetLanguage = 'English' | 'Chinese' | 'Spanish' | 'French' | 'German' | 'Japanese' | 'Korean';

export type ScriptStyle = 'Professional' | 'Conversational' | 'Academic' | 'Enthusiastic' | 'Humorous' | 'Custom';
