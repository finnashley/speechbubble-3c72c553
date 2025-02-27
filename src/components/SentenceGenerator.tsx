
import React, { useState } from "react";
import { SelectedVocabulary, GeneratedSentence } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Key, MessageCircle } from "lucide-react";
import { generateSentences, getStoredApiKey, saveApiKey } from "../services/openaiService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ApiKeyModal from "./ApiKeyModal";

interface SentenceGeneratorProps {
  selectedVocabulary: SelectedVocabulary[];
  onSentencesGenerated: (sentences: GeneratedSentence[]) => void;
}

const SentenceGenerator: React.FC<SentenceGeneratorProps> = ({
  selectedVocabulary,
  onSentencesGenerated,
}) => {
  const [count, setCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { toast } = useToast();
  
  const storedApiKey = getStoredApiKey();
  const hasApiKey = !!storedApiKey;

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
      const sentences = await generateSentences(selectedVocabulary, count);
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
              <label htmlFor="sentence-count" className="text-sm font-medium">
                Number of sentences
              </label>
              <span className="text-sm font-medium">{count}</span>
            </div>
            <Slider
              id="sentence-count"
              value={[count]}
              min={1}
              max={5}
              step={1}
              onValueChange={(values) => setCount(values[0])}
            />
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
