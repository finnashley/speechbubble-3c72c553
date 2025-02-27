
// Service to handle ElevenLabs Text-to-Speech API
interface SpeechOptions {
  apiKey: string;
  voice?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  speakingRate?: number;
}

export const generateSpeech = async (
  text: string,
  options: SpeechOptions
): Promise<string | null> => {
  try {
    const {
      apiKey,
      voice = "pNInz6obpgDQGcFmaJgB", // Adam voice
      model = "eleven_monolingual_v1",
      stability = 0.5,
      similarityBoost = 0.75,
      speakingRate = 1.0
    } = options;
    
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
            speaking_rate: speakingRate
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
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
