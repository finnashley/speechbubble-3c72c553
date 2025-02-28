
import axios from "axios";
import {
  GrammarLevel,
  SelectedVocabulary,
  SentenceResponse,
  TestType,
  GeneratedSentence,
} from "../lib/types";
import { v4 as uuidv4 } from 'uuid';

const API_URL = "https://api.openai.com/v1/chat/completions";

const getAuthHeader = () => {
  const apiKey = localStorage.getItem("openai-api-key");
  
  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please add your API key in the settings.");
  }
  
  return {
    Authorization: `Bearer ${apiKey}`,
  };
};

export const getJapaneseToEnglishSentences = async (
  selectedVocabulary: SelectedVocabulary[],
  count: number,
  grammarLevel: GrammarLevel
): Promise<SentenceResponse[]> => {
  const vocabWords = selectedVocabulary
    .map((v) => `${v.characters}: ${v.meanings[0]}`)
    .join("\n");

  const prompt = `Please create ${count} Japanese sentences using the following vocabulary. 
  Each sentence should be at a ${grammarLevel} level difficulty.
  For each sentence, provide:
  1. The Japanese sentence
  2. The English translation
  3. The vocabulary words used in the sentence (from the list)
  Format as a JSON array: [{"japanese": "日本語の文", "english": "English translation", "vocabUsed": ["vocab1", "vocab2"]}]

  Vocabulary:
  ${vocabWords}
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a Japanese language teacher creating practice sentences.",
          },
          { role: "user", content: prompt },
        ],
      },
      { headers: getAuthHeader() }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error fetching sentences:", error);
    throw error;
  }
};

export const getEnglishToJapaneseVocab = async (
  selectedVocabulary: SelectedVocabulary[],
  count: number
): Promise<SentenceResponse[]> => {
  // For English to Japanese, we'll just use the vocabulary directly
  // Randomly select the requested number of vocabulary items
  const shuffled = [...selectedVocabulary].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  // Transform them into the expected format
  return selected.map(vocab => ({
    japanese: vocab.characters,
    english: vocab.meanings[0],
    vocabUsed: [vocab.characters]
  }));
};

export const getSentences = async (
  selectedVocabulary: SelectedVocabulary[],
  count: number,
  grammarLevel: GrammarLevel,
  testType: TestType
): Promise<SentenceResponse[]> => {
  if (testType === "englishToJapanese") {
    return getEnglishToJapaneseVocab(selectedVocabulary, count);
  } else {
    // For both "listening" and "japaneseToEnglish" test types,
    // we use the same sentence generation function
    return getJapaneseToEnglishSentences(selectedVocabulary, count, grammarLevel);
  }
};

export const generateSentences = async (
  selectedVocabulary: SelectedVocabulary[],
  count: number,
  grammarLevel: GrammarLevel,
  testType: TestType
): Promise<GeneratedSentence[]> => {
  const sentenceResponses = await getSentences(selectedVocabulary, count, grammarLevel, testType);
  
  return sentenceResponses.map(response => ({
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    japanese: response.japanese,
    english: response.english,
    usedVocabulary: response.vocabUsed,
    testType: testType
  }));
};
