import { SelectedVocabulary, GeneratedSentence, GrammarLevel, TestType } from "../lib/types";

const STORAGE_KEY = "openai-api-key";

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEY, apiKey);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const generateSentences = async (
  vocabulary: SelectedVocabulary[],
  count: number = 1,
  grammarLevel: GrammarLevel = "beginner",
  testType: TestType = "japaneseToEnglish"
): Promise<GeneratedSentence[]> => {
  try {
    // Get API key from localStorage (fallback to env variable for development)
    const apiKey = getStoredApiKey() || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Extract only the Japanese words for the API request
    const vocabWords = vocabulary.map(v => v.characters);

    // Configure grammar instructions based on level
    let grammarInstructions = "";
    
    switch (grammarLevel) {
      case "beginner":
        grammarInstructions = "Use only very simple grammar patterns suitable for beginners. Stick to present tense, basic particles (は, が, を, に, で), and avoid complex conjugations. Keep sentences short and direct.";
        break;
      case "intermediate":
        grammarInstructions = "Use moderately complex grammar patterns suitable for intermediate learners. You can use past tense, て-form, simple conditional forms, and basic conjunctions. Keep sentence structures straightforward.";
        break;
      case "advanced":
        grammarInstructions = "Use more complex grammar patterns suitable for advanced learners. You can include passive voice, causative forms, conditional forms, and more complex sentence structures with multiple clauses.";
        break;
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Special case for vocabulary-only English to Japanese tests
    if (testType === "englishToJapanese") {
      // Randomly select a subset of vocabulary if more items are requested than available
      const selectedVocab = vocabulary.length <= count 
        ? vocabulary 
        : shuffleArray([...vocabulary]).slice(0, count);
      
      // Create direct vocabulary mapping rather than sentences
      const result: GeneratedSentence[] = selectedVocab.map((vocab, index) => {
        // Use the primary English meaning as the prompt
        const englishMeaning = vocab.meanings[0];
        
        return {
          id: `vocab-${Date.now()}-${index}`,
          createdAt: new Date().toISOString(),
          english: englishMeaning,
          japanese: vocab.characters,
          usedVocabulary: [vocab.characters],
          testType: "englishToJapanese",
        };
      });
      
      return result;
    } else if (testType === "listening" || testType === "japaneseToEnglish") {
      systemPrompt = `You are a Japanese language tutor helping students practice vocabulary. 
        Create ${count} Japanese sentences using ONLY the following vocabulary words: ${vocabWords.join(', ')}. 
        DO NOT use any words not in this list except for basic grammatical particles (は, が, を, に, で, etc.).
        ${grammarInstructions}
        Each sentence should be suitable for a ${grammarLevel} Japanese language learner.
        Remember: ONLY use the vocabulary words provided and basic particles. No other words allowed.`;
      
      userPrompt = `Create ${count} Japanese sentences using ONLY these words: ${vocabWords.join(', ')}.
        You may only use basic particles (は, が, を, に, で) in addition to these words.
        DO NOT use any other words or vocabulary that are not in the list.
        Return the response in the following JSON format:
        {
          "sentences": [
            {
              "japanese": "Japanese sentence here",
              "english": "English translation here",
              "usedVocabulary": ["word1", "word2"]
            }
          ]
        }`;
    } else {
      // This branch shouldn't be reached, but keeping it as a fallback
      systemPrompt = `You are a Japanese language tutor helping students practice vocabulary. 
        Create ${count} English sentences that can be translated to Japanese using ONLY the following vocabulary words: ${vocabWords.join(', ')}. 
        The Japanese translations should ONLY use words from this list except for basic grammatical particles (は, が, を, に, で, etc.).
        ${grammarInstructions}
        Each sentence should be suitable for a ${grammarLevel} Japanese language learner.
        Remember: When translated to Japanese, ONLY use the vocabulary words provided and basic particles. No other words allowed.`;
      
      userPrompt = `Create ${count} English sentences that can be translated to Japanese using ONLY these words: ${vocabWords.join(', ')}.
        For each English sentence, provide a Japanese translation that ONLY uses these vocabulary words and basic particles.
        DO NOT use any other Japanese words that are not in the list.
        Return the response in the following JSON format:
        {
          "sentences": [
            {
              "english": "English sentence here",
              "japanese": "Japanese translation here",
              "usedVocabulary": ["word1", "word2"]
            }
          ]
        }`;
    }

    // If we're just using vocab, we don't need to call OpenAI API
    if (testType === "englishToJapanese") {
      return Promise.resolve([]);
    }

    // Make direct request to OpenAI API only for sentence-based tests
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error from OpenAI API: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Parse the content from OpenAI response
    const content = data.choices[0].message.content;
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse OpenAI response");
    }

    // Map the parsed sentences to our expected format
    return parsedContent.sentences.map((sentence: any, index: number) => ({
      id: `sent-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      japanese: sentence.japanese,
      english: sentence.english,
      usedVocabulary: sentence.usedVocabulary || vocabWords,
      testType: testType,
    }));
  } catch (error) {
    console.error("Error generating sentences:", error);
    throw error;
  }
};

// Helper function to randomly shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
