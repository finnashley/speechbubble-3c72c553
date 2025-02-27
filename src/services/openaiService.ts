
import { SelectedVocabulary, GeneratedSentence, GrammarLevel } from "../lib/types";

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
  grammarLevel: GrammarLevel = "beginner"
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

    // Make direct request to OpenAI API
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
            content: `You are a Japanese language tutor helping students practice vocabulary. 
            Create ${count} Japanese sentences using ONLY the following vocabulary words: ${vocabWords.join(', ')}. 
            You may use basic grammatical particles and common words not in the list (like です, は, が, を, に, で, etc.).
            ${grammarInstructions}
            Each sentence should be suitable for a ${grammarLevel} Japanese language learner.`
          },
          {
            role: 'user',
            content: `Create ${count} Japanese sentences using only these words: ${vocabWords.join(', ')}.
            Return the response in the following JSON format:
            {
              "sentences": [
                {
                  "japanese": "Japanese sentence here",
                  "english": "English translation here",
                  "usedVocabulary": ["word1", "word2"]
                }
              ]
            }`
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
    }));
  } catch (error) {
    console.error("Error generating sentences:", error);
    throw error;
  }
};
