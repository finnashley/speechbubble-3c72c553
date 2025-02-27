
// WaniKani API Types
export interface WaniKaniUser {
  id: string;
  username: string;
  level: number;
  profile_url: string;
}

export interface WaniKaniVocabulary {
  id: number;
  object: string;
  url: string;
  data: {
    created_at: string;
    level: number;
    slug: string;
    hidden_at: string | null;
    document_url: string;
    characters: string;
    meanings: {
      meaning: string;
      primary: boolean;
      accepted_answer: boolean;
    }[];
    readings: {
      type: string;
      primary: boolean;
      accepted_answer: boolean;
      reading: string;
    }[];
    parts_of_speech: string[];
    component_subject_ids: number[];
    meaning_mnemonic: string;
    reading_mnemonic: string;
    context_sentences: {
      en: string;
      ja: string;
    }[];
  };
}

export interface SelectedVocabulary {
  id: number;
  characters: string;
  meanings: string[];
  readings: string[];
}

export type GrammarLevel = "beginner" | "intermediate" | "advanced";

export interface GeneratedSentence {
  id: string;
  createdAt: string;
  japanese: string;
  english: string;
  usedVocabulary: string[];
  incorrectAnswer?: boolean;
  testType?: TestType; // Make this optional since older sentences may not have it
}

// User settings and preferences
export interface AppState {
  apiKey: string | null;
  user: WaniKaniUser | null;
  vocabulary: SelectedVocabulary[];
  generatedSentences: GeneratedSentence[];
}

export type TestType = "listening" | "japaneseToEnglish" | "englishToJapanese";

export interface TestSettings {
  count: number;
  grammarLevel: GrammarLevel;
  testType: TestType;
  speakingSpeed?: "slow" | "medium" | "fast";
}
