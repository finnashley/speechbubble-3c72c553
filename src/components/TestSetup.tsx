
import React, { useState } from "react";
import { SelectedVocabulary, GrammarLevel, TestType } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Headphones, Languages, Type } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestSetupProps {
  selectedVocabulary: SelectedVocabulary[];
  onStartTest: (count: number, grammarLevel: GrammarLevel, testType: TestType, speakingSpeed?: string) => void;
}

const PRESET_COUNTS = [5, 10, 15, 20];

const GRAMMAR_LEVELS: { value: GrammarLevel; label: string; description: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Simple sentences with basic particles and present tense",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "More complex grammar patterns and past tense",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Advanced grammar patterns and complex sentence structures",
  },
];

const TEST_TYPES: { value: TestType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "listening",
    label: "Japanese Listening",
    description: "Listen to Japanese sentences and translate them to English",
    icon: <Headphones className="h-5 w-5" />,
  },
  {
    value: "japaneseToEnglish",
    label: "Japanese to English",
    description: "Read Japanese sentences and translate them to English",
    icon: <Type className="h-5 w-5" />,
  },
  {
    value: "englishToJapanese",
    label: "English to Japanese",
    description: "Read English vocabulary and translate to Japanese",
    icon: <Languages className="h-5 w-5" />,
  },
];

const SPEAKING_SPEEDS = [
  { value: "slow", label: "Slow" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast" },
];

const TestSetup: React.FC<TestSetupProps> = ({
  selectedVocabulary,
  onStartTest,
}) => {
  const [count, setCount] = useState<number>(5);
  const [customCount, setCustomCount] = useState<string>("");
  const [grammarLevel, setGrammarLevel] = useState<GrammarLevel>("beginner");
  const [testType, setTestType] = useState<TestType>("japaneseToEnglish");
  const [speakingSpeed, setSpeakingSpeed] = useState<string>("medium");
  const [isStarting, setIsStarting] = useState(false);

  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    setCustomCount("");
  };

  const handleCustomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomCount(value);
      if (value !== "") {
        const numValue = parseInt(value, 10);
        if (numValue > 0 && numValue <= 50) {
          setCount(numValue);
        }
      }
    }
  };

  const handleStartTest = async () => {
    setIsStarting(true);
    try {
      await onStartTest(count, grammarLevel, testType, testType === "listening" ? speakingSpeed : undefined);
    } finally {
      setIsStarting(false);
    }
  };

  // Determine if we're using vocabulary words or sentences based on the test type
  const isVocabWordTest = testType === "englishToJapanese";
  const itemTypeLabel = isVocabWordTest ? "vocabulary words" : "test sentences";

  return (
    <Card className="app-card w-full slide-up">
      <CardHeader>
        <div className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          <CardTitle>Test Setup</CardTitle>
        </div>
        <CardDescription>
          Configure and start your practice test with selected vocabulary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Test Type
          </label>
          <RadioGroup 
            value={testType}
            onValueChange={(value) => setTestType(value as TestType)}
            className="grid grid-cols-1 gap-2 mt-2"
          >
            {TEST_TYPES.map((type) => (
              <div key={type.value} className="flex items-start space-x-2 rounded-md border p-3">
                <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                <div className="flex flex-col">
                  <div className="flex items-center">
                    {type.icon}
                    <Label htmlFor={`type-${type.value}`} className="font-medium ml-2">
                      {type.label}
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {testType === "listening" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Speaking Speed
            </label>
            <RadioGroup 
              value={speakingSpeed}
              onValueChange={setSpeakingSpeed}
              className="flex flex-wrap gap-2 mt-2"
            >
              {SPEAKING_SPEEDS.map((speed) => (
                <div key={speed.value} className="flex items-center space-x-2 rounded-md border p-3 flex-1">
                  <RadioGroupItem value={speed.value} id={`speed-${speed.value}`} />
                  <Label htmlFor={`speed-${speed.value}`} className="font-medium">
                    {speed.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Number of {itemTypeLabel}: <span className="font-semibold">{count}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COUNTS.map((presetCount) => (
              <Button
                key={presetCount}
                variant={count === presetCount && customCount === "" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCountChange(presetCount)}
                className="flex-1 min-w-16"
              >
                {presetCount}
              </Button>
            ))}
            <div className="flex-1 min-w-24">
              <Input
                value={customCount}
                onChange={handleCustomCountChange}
                placeholder="Custom"
                className="h-9"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {!isVocabWordTest && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Grammar Proficiency Level
            </label>
            <RadioGroup 
              value={grammarLevel}
              onValueChange={(value) => setGrammarLevel(value as GrammarLevel)}
              className="grid grid-cols-1 gap-2 mt-2"
            >
              {GRAMMAR_LEVELS.map((level) => (
                <div key={level.value} className="flex items-start space-x-2 rounded-md border p-3">
                  <RadioGroupItem value={level.value} id={`level-${level.value}`} />
                  <div className="flex flex-col">
                    <Label htmlFor={`level-${level.value}`} className="font-medium">
                      {level.label}
                    </Label>
                    <span className="text-xs text-muted-foreground">{level.description}</span>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="text-sm">
          <div className="flex items-center mb-2">
            <span className="font-medium">Selected vocabulary:</span>
            <span className="ml-2 text-muted-foreground">{selectedVocabulary.length} words</span>
          </div>
          
          {selectedVocabulary.length === 0 && (
            <p className="text-muted-foreground">
              No vocabulary selected. Please select some words from the list.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleStartTest}
          disabled={isStarting || selectedVocabulary.length === 0}
          className="w-full"
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Test...
            </>
          ) : (
            <>
              {testType === "listening" ? (
                <Headphones className="mr-2 h-4 w-4" />
              ) : testType === "japaneseToEnglish" ? (
                <Type className="mr-2 h-4 w-4" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
              )}
              Start {TEST_TYPES.find(t => t.value === testType)?.label} Test with {count} {isVocabWordTest ? "Words" : "Sentences"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestSetup;
