
export type PostFormat = 'feed' | 'story';

export interface NewsContent {
  title: string;
  subtitle: string;
  summary: string;
  imageUrl: string;
  logoUrl?: string;
}

export interface AppState {
  step: 'input' | 'edit';
  content: NewsContent;
  showLogo: boolean;
  isProcessing: boolean;
}
