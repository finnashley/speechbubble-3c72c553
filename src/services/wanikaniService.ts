
import { WaniKaniUser, WaniKaniVocabulary, SelectedVocabulary } from "../lib/types";

const API_BASE_URL = "https://api.wanikani.com/v2";

export const fetchUser = async (apiKey: string): Promise<WaniKaniUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Wanikani-Revision": "20170710",
      },
    });

    if (!response.ok) {
      throw new Error(`WaniKani API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.data.id,
      username: data.data.username,
      level: data.data.level,
      profile_url: data.data.profile_url,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const fetchVocabulary = async (
  apiKey: string,
  levels?: number[]
): Promise<SelectedVocabulary[]> => {
  try {
    let url = `${API_BASE_URL}/subjects?types=vocabulary`;
    
    // Add level filter if provided
    if (levels && levels.length > 0) {
      url += `&levels=${levels.join(",")}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Wanikani-Revision": "20170710",
      },
    });

    if (!response.ok) {
      throw new Error(`WaniKani API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const allVocabulary: WaniKaniVocabulary[] = data.data;
    
    // Process response into a simplified vocabulary format
    const processedVocabulary: SelectedVocabulary[] = allVocabulary.map((vocab) => ({
      id: vocab.id,
      characters: vocab.data.characters,
      meanings: vocab.data.meanings.map((m) => m.meaning),
      readings: vocab.data.readings.map((r) => r.reading),
    }));

    return processedVocabulary;
  } catch (error) {
    console.error("Error fetching vocabulary:", error);
    throw error;
  }
};

// Get vocabulary by level (level can be a single level or a range)
export const fetchVocabularyByLevel = async (
  apiKey: string,
  level: number
): Promise<SelectedVocabulary[]> => {
  return fetchVocabulary(apiKey, [level]);
};

// Get all vocabulary at or below the user's current level
export const fetchAllAvailableVocabulary = async (
  apiKey: string,
  currentLevel: number
): Promise<SelectedVocabulary[]> => {
  const levels = Array.from({ length: currentLevel }, (_, i) => i + 1);
  return fetchVocabulary(apiKey, levels);
};
