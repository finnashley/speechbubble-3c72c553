
import { SelectedVocabulary, GeneratedSentence } from "../lib/types";

export const generateSentences = async (
  vocabulary: SelectedVocabulary[],
  count: number = 1
): Promise<GeneratedSentence[]> => {
  try {
    // Extract only the Japanese words for the API request
    const vocabWords = vocabulary.map(v => v.characters);

    const response = await fetch('/api/generate-sentence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vocabulary: vocabWords,
        count: count,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error generating sentences: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sentences.map((sentence: any, index: number) => ({
      id: `sent-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      japanese: sentence.japanese,
      english: sentence.english,
      usedVocabulary: sentence.usedVocabulary || vocabWords,
    }));
  } catch (error) {
    console.error("Error generating sentences:", error);
    throw error;
  }
};
