
import React, { useState } from "react";
import { SelectedVocabulary, GeneratedSentence } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { generateSentences } from "../services/openaiService";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (selectedVocabulary.length === 0) {
      toast({
        title: "No vocabulary selected",
        description: "Please select at least one vocabulary word.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const sentences = await generateSentences(selectedVocabulary, count);
      onSentencesGenerated(sentences);
      toast({
        title: "Sentences generated",
        description: `Successfully created ${sentences.length} new sentences.`,
      });
    } catch (error) {
      console.error("Error generating sentences:", error);
      toast({
        title: "Error",
        description: "Failed to generate sentences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="app-card w-full slide-up">
      <CardHeader>
        <CardTitle>Generate Sentences</CardTitle>
        <CardDescription>
          Create practice sentences using your selected vocabulary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="p-4 bg-secondary rounded-lg">
          <h4 className="font-medium mb-2">Selected Vocabulary ({selectedVocabulary.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedVocabulary.length > 0 ? (
              selectedVocabulary.map((vocab) => (
                <span
                  key={vocab.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {vocab.characters}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No vocabulary selected. Please select some words.
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || selectedVocabulary.length === 0}
          className="w-full"
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
  );
};

export default SentenceGenerator;
