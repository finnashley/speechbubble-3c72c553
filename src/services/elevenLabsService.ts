
interface ElevenLabsOptions {
  apiKey: string;
  voiceId?: string;
  model?: string;
}

const defaultVoice = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Japanese voice)
const defaultModel = "eleven_multilingual_v2"; // Best for multi-language support

export const generateSpeech = async (
  text: string,
  options: ElevenLabsOptions
): Promise<string | null> => {
  const { apiKey, voiceId = defaultVoice, model = defaultModel } = options;
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs API error:", errorData);
      return null;
    }

    // Get the audio data and convert it to a data URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};
