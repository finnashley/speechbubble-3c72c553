
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GeneratedSentence } from "@/lib/types";
import { Loader2, Check, X, ArrowRight, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const currentSentence = sentences[currentIndex];
  const isLastSentence = currentIndex === sentences.length - 1;

  // Function to check user's answer against correct answer
  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Empty answer",
        description: "Please type your translation before submitting.",
        variant: "destructive",
      });
      return;
    }

    const userAnswerLower = userAnswer.trim().toLowerCase();
    const correctAnswerLower = currentSentence.english.toLowerCase();
    
    // Simple fuzzy matching - should match if the answer is roughly correct
    const isAnswerCorrect = 
      userAnswerLower === correctAnswerLower ||
      correctAnswerLower.includes(userAnswerLower) ||
      userAnswerLower.includes(correctAnswerLower);
    
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

  return (
    <Card className="w-full mt-4 mb-4 slide-up">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Translation Test</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-reading" 
              checked={showReading} 
              onCheckedChange={setShowReading} 
            />
            <Label htmlFor="show-reading">Show Reading</Label>
          </div>
        </div>
        <CardDescription>
          Translate the Japanese sentence to English. 
          Progress: {currentIndex + 1} / {sentences.length}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          <h3 className="font-bold mb-1 text-lg">Translate this sentence:</h3>
          <p className="text-xl mb-2 font-japanese">{currentSentence.japanese}</p>
          
          {showReading && renderJapaneseWithFurigana()}
          
          {isAnswerSubmitted && (
            <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Correct translation:</h4>
              <p className="text-md">{currentSentence.english}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your English translation here..."
            disabled={isAnswerSubmitted}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isAnswerSubmitted) {
                checkAnswer();
              }
            }}
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span>Score: {score.correct} / {score.total}</span>
          <span>Used vocabulary: {currentSentence.usedVocabulary.join(", ")}</span>
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
              <>Next Sentence <ArrowRight className="ml-2 h-4 w-4" /></>
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
