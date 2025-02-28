
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GeneratedSentence, TestType } from "@/lib/types";
import { Loader2, Check, X, ArrowRight, RotateCcw, Play, Pause, Headphones, Languages, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSpeech } from "@/services/elevenLabsService";
import { convertRomajiToKana } from "@/utils/romajiConverter";

interface TestModeProps {
  sentences: GeneratedSentence[];
  onExitTest: () => void;
}

const TestMode: React.FC<TestModeProps> = ({ sentences, onExitTest }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem("elevenlabs-api-key"));
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [romajiInput, setRomajiInput] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const currentSentence = sentences[currentIndex];
  const isLastSentence = currentIndex === sentences.length - 1;
  
  // Determine test type - prioritize the localStorage value then fallback to sentence data
  const getTestType = (): TestType => {
    // First, check localStorage for the most recent test type
    const storedTestType = localStorage.getItem("testType") as TestType | null;
    
    if (storedTestType) {
      return storedTestType;
    }
    
    // Then check the current sentence metadata
    if (currentSentence?.testType) {
      return currentSentence.testType;
    }
    
    // Default fallback
    return "japaneseToEnglish";
  };
  
  const testType = getTestType();
  const isListeningTest = testType === "listening";
  const isJapaneseToEnglish = testType === "japaneseToEnglish";
  const isEnglishToJapanese = testType === "englishToJapanese";
  
  // Check if we're in vocabulary mode (English to Japanese without sentences)
  const isVocabMode = isEnglishToJapanese && 
                     (!currentSentence?.japanese?.includes(' ') || 
                      !currentSentence?.english?.includes(' '));

  // Handle romaji input change
  const handleRomajiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRomajiInput(input);
    
    // Convert romaji to kana only when in English to Japanese mode
    if (isEnglishToJapanese) {
      const convertedText = convertRomajiToKana(input);
      setUserAnswer(convertedText);
    } else {
      setUserAnswer(input);
    }
  };

  // Function to generate speech for the current sentence
  const generateAudio = async (autoPlay = false) => {
    if (!apiKey) {
      const newApiKey = prompt("Please enter your ElevenLabs API key to enable speech:");
      if (!newApiKey) {
        toast({
          title: "API Key Required",
          description: "A valid ElevenLabs API key is required for speech functionality.",
          variant: "destructive",
        });
        return;
      }
      localStorage.setItem("elevenlabs-api-key", newApiKey);
      setApiKey(newApiKey);
    }

    const textToSpeak = currentSentence.japanese;
    
    setIsLoadingAudio(true);
    // Get the speaking speed from localStorage or use default
    const speechSpeed = localStorage.getItem("speechSpeed") || "medium";
    
    // Map the speaking speed to a stability and similarity boost value
    let stability = 0.5;
    let similarityBoost = 0.75;
    
    if (speechSpeed === "slow") {
      stability = 0.8;
      similarityBoost = 0.3;
    } else if (speechSpeed === "fast") {
      stability = 0.3;
      similarityBoost = 0.8;
    }
    
    const url = await generateSpeech(textToSpeak, { 
      apiKey: apiKey!,
      stability,
      similarityBoost,
      speakingRate: speechSpeed === "slow" ? 0.7 : speechSpeed === "fast" ? 1.5 : 1,
      isJapanese: true // Add this flag for Japanese text
    });
    setIsLoadingAudio(false);
    
    if (url) {
      setAudioUrl(url);
      if (autoPlay) {
        // Set a short timeout to ensure the audio element has loaded
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);
      } else {
        toast({
          title: "Audio Generated",
          description: "The sentence audio is ready to play.",
        });
      }
    } else {
      toast({
        title: "Audio Generation Failed",
        description: "There was an error generating the audio. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  // Automatically generate and play audio for listening tests when moving to a new sentence
  useEffect(() => {
    if (isListeningTest && currentSentence) {
      generateAudio(true);
    }
  }, [currentIndex, isListeningTest, currentSentence]);

  // Function to play/pause the audio
  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Effect to handle audio events
  useEffect(() => {
    if (audioRef.current) {
      const onEnded = () => setIsPlaying(false);
      audioRef.current.addEventListener('ended', onEnded);
      
      return () => {
        audioRef.current?.removeEventListener('ended', onEnded);
      };
    }
  }, [audioUrl]);

  // Function to load audio when changing to a new sentence
  useEffect(() => {
    // Clean up previous audio URL if exists
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    
    // Reset romaji input when changing sentences
    setRomajiInput("");
    setUserAnswer("");
  }, [currentIndex]);

  // Check if user's answer is valid (not a single vowel or too short)
  const isValidAnswer = (answer: string): boolean => {
    const trimmedAnswer = answer.trim();
    
    // For vocabulary mode, we can be less strict with answer length
    if (isVocabMode) {
      return trimmedAnswer.length > 0;
    }
    
    // Check if it's just a single vowel
    if (/^[aeiouあいうえお]$/i.test(trimmedAnswer)) {
      return false;
    }
    
    // Check if it's too short (less than 2 characters)
    if (trimmedAnswer.length < 2) {
      return false;
    }
    
    return true;
  };

  // Improved function to check user's answer against correct answer
  const checkAnswer = () => {
    const trimmedAnswer = userAnswer.trim();
    
    if (!trimmedAnswer) {
      toast({
        title: "Empty answer",
        description: "Please type your translation before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Check if answer is valid
    if (!isValidAnswer(trimmedAnswer)) {
      toast({
        title: "Invalid answer",
        description: "Your answer is too short or too simple to be evaluated.",
        variant: "destructive",
      });
      return;
    }

    // Get the expected answer based on test type
    const correctAnswer = isEnglishToJapanese 
      ? currentSentence.japanese 
      : currentSentence.english;
    
    const userAnswerLower = trimmedAnswer.toLowerCase();
    const correctAnswerLower = correctAnswer.toLowerCase();
    
    // More robust matching - check for significant overlap
    const isAnswerCorrect = (() => {
      // For vocabulary mode, we need a more exact match
      if (isVocabMode) {
        // For Japanese answers, compare the characters
        return userAnswerLower === correctAnswerLower ||
               // Allow for slight variations or missing particles
               (userAnswerLower.replace(/[はがをにで]/g, '') === 
                correctAnswerLower.replace(/[はがをにで]/g, ''));
      }
      
      // For Japanese answers we need a different approach
      if (isEnglishToJapanese) {
        // Simple check - does the answer contain most of the key characters?
        const userChars = new Set(userAnswerLower.split(''));
        const correctChars = new Set(correctAnswerLower.split(''));
        
        // Count matching characters
        let matchCount = 0;
        for (const char of userChars) {
          if (correctChars.has(char)) matchCount++;
        }
        
        // If more than 70% of characters match, consider it correct
        return matchCount >= correctChars.size * 0.7;
      }
      
      // English answer checking logic
      // Exact match
      if (userAnswerLower === correctAnswerLower) {
        return true;
      }
      
      // If user answer is very short compared to correct answer, be more strict
      if (userAnswerLower.length < correctAnswerLower.length * 0.5) {
        return correctAnswerLower.includes(userAnswerLower) && 
               userAnswerLower.length > 5; // Only accept if it's a substantial part
      }
      
      // If correct answer contains user answer or vice versa
      if (correctAnswerLower.includes(userAnswerLower) || 
          userAnswerLower.includes(correctAnswerLower)) {
        return true;
      }
      
      // Check word overlap - more than 60% of words match
      const userWords = userAnswerLower.split(/\s+/).filter(w => w.length > 1);
      const correctWords = correctAnswerLower.split(/\s+/).filter(w => w.length > 1);
      
      if (userWords.length === 0 || correctWords.length === 0) {
        return false;
      }
      
      const matchingWords = userWords.filter(word => 
        correctWords.some(correctWord => 
          correctWord.includes(word) || word.includes(correctWord)
        )
      );
      
      return matchingWords.length >= Math.min(userWords.length, correctWords.length) * 0.6;
    })();
    
    setIsCorrect(isAnswerCorrect);
    setIsAnswerSubmitted(true);
    
    // Mark the sentence as incorrect if the answer was wrong
    if (!isAnswerCorrect) {
      currentSentence.incorrectAnswer = true;
    }
    
    setScore(prev => ({
      correct: prev.correct + (isAnswerCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isAnswerCorrect) {
      toast({
        title: "Correct!",
        description: "Great job! Your translation is correct.",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Check the correct translation and try again.",
        variant: "destructive",
      });
    }
  };

  // Move to next sentence
  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setRomajiInput("");
      setIsAnswerSubmitted(false);
    } else {
      // Test completed
      toast({
        title: "Test completed!",
        description: `Your score: ${score.correct} / ${score.total}`,
      });
      
      // If this is the last sentence, exit the test mode
      if (isLastSentence) {
        onExitTest();
      }
    }
  };

  // Restart the test
  const restartTest = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setRomajiInput("");
    setIsAnswerSubmitted(false);
    setScore({ correct: 0, total: 0 });
    toast({
      title: "Test restarted",
      description: "Let's try again!",
    });
  };

  // Generate a simple furigana display
  // Note: In a production app, you would use a proper furigana library
  const renderJapaneseWithFurigana = () => {
    // Just a placeholder - in reality you'd need proper furigana parsing
    return (
      <div className="flex flex-col mb-3">
        <span className="text-sm text-muted-foreground">
          {currentSentence.usedVocabulary.join(", ")}
        </span>
      </div>
    );
  };

  if (!currentSentence) {
    return (
      <Card className="w-full mt-4 mb-4">
        <CardContent className="pt-6 text-center">
          <p>No sentences available for testing. Please generate some sentences first.</p>
          <Button onClick={onExitTest} className="mt-4">
            Back to Sentence Generator
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getTestIcon = () => {
    if (isListeningTest) return <Headphones className="h-5 w-5 mr-2" />;
    if (isJapaneseToEnglish) return <Type className="h-5 w-5 mr-2" />;
    if (isEnglishToJapanese) return <Languages className="h-5 w-5 mr-2" />;
    return null;
  };

  const getTestTitle = () => {
    if (isListeningTest) return "Listening Test";
    if (isJapaneseToEnglish) return "Japanese to English";
    if (isEnglishToJapanese) return isVocabMode ? "English to Japanese Vocabulary" : "English to Japanese";
    return "Translation Test";
  };

  const getTestPrompt = () => {
    if (isListeningTest) return "Listen to the Japanese and translate to English";
    if (isJapaneseToEnglish) return "Translate the Japanese sentence to English";
    if (isEnglishToJapanese) return isVocabMode 
      ? "Translate the English vocabulary to Japanese" 
      : "Translate the English sentence to Japanese";
    return "Translate the sentence";
  };

  const getProgressLabel = () => {
    const itemType = isVocabMode ? "words" : "sentences";
    return `Progress: ${currentIndex + 1} / ${sentences.length} ${itemType}`;
  };

  return (
    <Card className="w-full mt-4 mb-4 slide-up">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {getTestIcon()}
            <CardTitle>{getTestTitle()}</CardTitle>
          </div>
          {!isListeningTest && isJapaneseToEnglish && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-reading" 
                checked={showReading} 
                onCheckedChange={setShowReading} 
              />
              <Label htmlFor="show-reading">Show Reading</Label>
            </div>
          )}
        </div>
        <CardDescription>
          {getTestPrompt()}. {getProgressLabel()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg">
              {isListeningTest 
                ? "Listen and translate:" 
                : `Translate this ${isJapaneseToEnglish ? "Japanese" : "English"}:`
              }
            </h3>
            <div>
              {isListeningTest || isJapaneseToEnglish ? (
                audioUrl ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleAudio}
                    disabled={isLoadingAudio}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => generateAudio(isListeningTest)}
                    disabled={isLoadingAudio}
                  >
                    {isLoadingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  </Button>
                )
              ) : null}
            </div>
          </div>
          
          {!isListeningTest && (
            <p className={`text-xl mb-2 ${isJapaneseToEnglish ? "font-japanese" : ""}`}>
              {isJapaneseToEnglish ? currentSentence.japanese : currentSentence.english}
            </p>
          )}
          
          {/* Hidden audio element */}
          {audioUrl && (
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                toast({
                  title: "Playback Error",
                  description: "Unable to play the audio. Please try again.",
                  variant: "destructive",
                });
                setIsPlaying(false);
              }}
            />
          )}
          
          {isJapaneseToEnglish && showReading && renderJapaneseWithFurigana()}
          
          {isAnswerSubmitted && (
            <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Correct translation:
              </h4>
              <p className={`text-md ${isEnglishToJapanese ? "font-japanese" : ""}`}>
                {isEnglishToJapanese ? currentSentence.japanese : currentSentence.english}
              </p>
              
              {isListeningTest && isAnswerSubmitted && (
                <div className="mt-2 pt-2 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Original Japanese:
                  </h4>
                  <p className="text-md font-japanese">{currentSentence.japanese}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {isEnglishToJapanese ? (
            <div className="flex flex-col space-y-2">
              <Input
                value={romajiInput}
                onChange={handleRomajiInputChange}
                placeholder="Type romaji here (e.g. 'konnichiwa' for 'こんにちは')"
                disabled={isAnswerSubmitted}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswerSubmitted) {
                    checkAnswer();
                  }
                }}
              />
              <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                <p className="font-japanese text-lg">
                  {userAnswer || <span className="text-muted-foreground text-sm">Japanese characters will appear here as you type</span>}
                </p>
              </div>
            </div>
          ) : (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={`Type your ${isEnglishToJapanese ? "Japanese" : "English"} translation here...`}
              disabled={isAnswerSubmitted}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAnswerSubmitted) {
                  checkAnswer();
                }
              }}
            />
          )}
        </div>

        <div className="flex justify-between items-center text-sm">
          <span>Score: {score.correct} / {score.total}</span>
          {!isVocabMode && (
            <span>Used vocabulary: {currentSentence.usedVocabulary.join(", ")}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline"
          onClick={onExitTest}
          className="sm:mr-auto w-full sm:w-auto"
        >
          Exit Test
        </Button>
        
        {isAnswerSubmitted ? (
          <Button 
            onClick={nextSentence}
            className="w-full sm:w-auto"
            variant={isCorrect ? "default" : "secondary"}
          >
            {isLastSentence ? (
              <>Finish Test</>
            ) : (
              <>Next {isVocabMode ? "Word" : "Sentence"} <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        ) : (
          <Button 
            onClick={checkAnswer}
            className="w-full sm:w-auto"
          >
            Check Answer
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={restartTest}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Restart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestMode;
