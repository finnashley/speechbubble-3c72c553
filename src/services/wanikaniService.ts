
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

// Fetch assignments to get SRS status
export const fetchAssignments = async (
  apiKey: string
): Promise<Record<number, string>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assignments?subject_types=vocabulary`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Wanikani-Revision": "20170710",
      },
    });

    if (!response.ok) {
      throw new Error(`WaniKani API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Create a map of subject_id to srs_stage
    const assignmentMap: Record<number, string> = {};
    data.data.forEach((assignment: any) => {
      assignmentMap[assignment.data.subject_id] = assignment.data.srs_stage_name;
    });

    return assignmentMap;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return {};
  }
};

export const fetchVocabulary = async (
  apiKey: string,
  levels?: number[],
  srsFilter: boolean = true
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
    let processedVocabulary: SelectedVocabulary[] = allVocabulary.map((vocab) => ({
      id: vocab.id,
      characters: vocab.data.characters,
      meanings: vocab.data.meanings.map((m) => m.meaning),
      readings: vocab.data.readings.map((r) => r.reading),
    }));

    // If SRS filtering is enabled, filter by started items
    if (srsFilter) {
      // Fetch assignments to get SRS status
      const assignments = await fetchAssignments(apiKey);
      
      // Filter vocabulary to only include items that have been started in SRS
      processedVocabulary = processedVocabulary.filter(vocab => 
        assignments[vocab.id] !== undefined && assignments[vocab.id] !== null
      );
      
      console.log(`Filtered to ${processedVocabulary.length} vocabulary items with SRS data`);
    }

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
  return fetchVocabulary(apiKey, levels, true);
};
