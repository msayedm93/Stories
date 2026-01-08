export interface StoryPage {
  text: string;
  translatedText: string;
  imagePrompt: string;
  imageUrl?: string;
  audioData?: string;
  magicFact?: string; // New: Educational snippet
}

export interface Story {
  id: string;
  title: string;
  translatedTitle: string;
  age: number;
  language: 'en' | 'ar';
  pages: StoryPage[];
  childName?: string;
  themeColor: string;
  magicLesson?: string; // New: Overall moral or lesson
  createdAt: number;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_ASSETS = 'GENERATING_ASSETS',
  READING = 'READING',
  LIBRARY = 'LIBRARY'
}

export type ThemeMode = 'light' | 'dark';