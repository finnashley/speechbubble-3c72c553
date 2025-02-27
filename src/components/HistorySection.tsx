
import React from "react";
import { GeneratedSentence } from "../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface HistorySectionProps {
  sentences: GeneratedSentence[];
  onClearHistory: () => void;
  onDeleteSentence: (id: string) => void;
  showOnlyIfHasHistory?: boolean;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  sentences,
  onClearHistory,
  onDeleteSentence,
  showOnlyIfHasHistory = false,
}) => {
  // If there are no sentences and we're in "only show if has history" mode, don't render anything
  if (sentences.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="app-card w-full slide-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Practice History</CardTitle>
          <CardDescription>
            {sentences.length} generated {sentences.length === 1 ? "sentence" : "sentences"}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearHistory}
          className="text-muted-foreground"
        >
          Clear All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sentences.map((sentence) => (
            <div
              key={sentence.id}
              className="border border-border rounded-lg p-4 space-y-2 relative app-card"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteSentence(sentence.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <p className="text-lg font-medium">{sentence.japanese}</p>
              <p className="text-sm text-muted-foreground">{sentence.english}</p>
              
              <div className="pt-2 border-t border-border mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {sentence.usedVocabulary.map((word, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                {formatDate(sentence.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistorySection;
