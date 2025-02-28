
// Service to handle ElevenLabs Text-to-Speech API
interface SpeechOptions {
  apiKey: string;
  voice?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  speakingRate?: number;
  isJapanese?: boolean;
}

export const generateSpeech = async (
  text: string,
  options: SpeechOptions
): Promise<string | null> => {
  try {
    const {
      apiKey,
      // Use provided custom Japanese voice ID or default to Adam for English
      voice = options.isJapanese ? "RBnMinrYKeccY3vaUxlZ" : "pNInz6obpgDQGcFmaJgB", 
      // Use the multilingual model for Japanese content
      model = options.isJapanese ? "eleven_multilingual_v2" : "eleven_monolingual_v1",
      similarityBoost = 0.75,
      speakingRate = 1.0
    } = options;
    
    // Adjust stability based on the speech speed setting
    // Higher stability (closer to 1.0) = slower, more consistent speech
    // Lower stability (closer to 0.0) = faster, more varied speech
    let stability = options.stability || 0.5;
    let adjustedSpeakingRate = speakingRate;
    
    // Get the speechSpeed from localStorage
    const speechSpeed = localStorage.getItem("speechSpeed") || "medium";
    
    // We'll use stability as our primary control for speed
    // and make small adjustments to speakingRate as well
    if (speechSpeed === "slow") {
      stability = 0.85; // Higher stability for slower speech
      adjustedSpeakingRate = speakingRate * 0.8; // Slightly slow down the speech
    } else if (speechSpeed === "medium") {
      stability = 0.5; // Default
      adjustedSpeakingRate = speakingRate;
    } else if (speechSpeed === "fast") {
      stability = 0.25; // Lower stability for faster speech
      adjustedSpeakingRate = speakingRate * 1.1; // Slightly speed up the speech
    }
    
    console.log(`Generating speech for text: "${text}"`);
    console.log(`Using voice: ${voice}, model: ${model}, isJapanese: ${options.isJapanese}`);
    console.log(`Speech parameters: stability=${stability}, similarityBoost=${similarityBoost}, speakingRate=${adjustedSpeakingRate}, speechSpeed=${speechSpeed}`);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            // Add speaking rate to control speed
            speaking_rate: adjustedSpeakingRate
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Convert the response to a blob
    const audioBlob = await response.blob();
    
    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};
