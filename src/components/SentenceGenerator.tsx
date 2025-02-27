
import React, { useState } from "react";
import { SelectedVocabulary, GeneratedSentence, GrammarLevel } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Key, MessageCircle } from "lucide-react";
import { generateSentences, getStoredApiKey, saveApiKey } from "../services/openaiService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ApiKeyModal from "./ApiKeyModal";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SentenceGeneratorProps {
  selectedVocabulary: SelectedVocabulary[];
  onSentencesGenerated: (sentences: GeneratedSentence[]) => void;
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

const SentenceGenerator: React.FC<SentenceGeneratorProps> = ({
  selectedVocabulary,
  onSentencesGenerated,
}) => {
  const [count, setCount] = useState<number>(5);
  const [customCount, setCustomCount] = useState<string>("");
  const [grammarLevel, setGrammarLevel] = useState<GrammarLevel>("beginner");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { toast } = useToast();
  
  const storedApiKey = getStoredApiKey();
  const hasApiKey = !!storedApiKey;

  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    setCustomCount("");
  };

  const handleCustomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
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

  const handleGenerate = async () => {
    if (selectedVocabulary.length === 0) {
      toast({
        title: "No vocabulary selected",
        description: "Please select at least one vocabulary word.",
        variant: "destructive",
      });
      return;
    }

    // Check if OpenAI API key is set
    if (!getStoredApiKey() && !import.meta.env.VITE_OPENAI_API_KEY) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const sentences = await generateSentences(selectedVocabulary, count, grammarLevel);
      onSentencesGenerated(sentences);
      toast({
        title: "Sentences generated",
        description: `Successfully created ${sentences.length} new sentences.`,
      });
    } catch (error) {
      console.error("Error generating sentences:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to generate sentences: ${errorMessage}`);
      
      // If API key is invalid, prompt to enter a new one
      if (errorMessage.includes("API key") || errorMessage.includes("401")) {
        toast({
          title: "API Key Issue",
          description: "Your API key might be invalid or expired. Please update it.",
          variant: "destructive",
        });
        setIsApiKeyModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate sentences. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApiKey = (apiKey: string) => {
    saveApiKey(apiKey);
    setError(null);
  };

  return (
    <>
      <Card className="app-card w-full slide-up">
        <CardHeader>
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-primary" />
            <CardTitle>Generate Sentences</CardTitle>
          </div>
          <CardDescription>
            Create practice sentences using your selected vocabulary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!hasApiKey && !import.meta.env.VITE_OPENAI_API_KEY && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Key Required</AlertTitle>
              <AlertDescription>
                An OpenAI API key is required to generate sentences.
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal text-primary"
                  onClick={() => setIsApiKeyModalOpen(true)}
                >
                  Add your API key
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Number of sentences
              </label>
              <span className="text-sm font-medium">{count}</span>
            </div>
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
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="sm:mr-auto"
          >
            <Key className="h-4 w-4 mr-2" />
            {hasApiKey ? "Update API Key" : "Add API Key"}
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedVocabulary.length === 0}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate ${count} ${count === 1 ? "Sentence" : "Sentences"}`
            )}
          </Button>
        </CardFooter>
      </Card>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        existingKey={storedApiKey || ""}
      />
    </>
  );
};

export default SentenceGenerator;
