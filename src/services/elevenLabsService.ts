
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
      // For Japanese content, use Matilda which has better Japanese support
      // or default to Adam if not specifically for Japanese
      voice = options.isJapanese ? "XrExE9yKIg1WjnnlVkGX" : "pNInz6obpgDQGcFmaJgB", 
      // Use the multilingual model for Japanese content
      model = options.isJapanese ? "eleven_multilingual_v2" : "eleven_monolingual_v1",
      stability = 0.5,
      similarityBoost = 0.75,
      speakingRate = 1.0
    } = options;
    
    console.log(`Generating speech for text: "${text}"`);
    console.log(`Using voice: ${voice}, model: ${model}, isJapanese: ${options.isJapanese}`);
    
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
