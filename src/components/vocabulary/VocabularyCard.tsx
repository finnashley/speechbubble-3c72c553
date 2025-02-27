
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectedVocabulary } from "@/lib/types";

interface VocabularyCardProps {
  vocab: SelectedVocabulary;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocab,
  isSelected,
  onToggle,
}) => {
  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        isSelected
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border hover:border-border/80"
      }`}
    >
      <div className="flex items-start">
        <Checkbox
          id={`vocab-${vocab.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(vocab.id)}
          className="mt-1"
        />
        <div className="ml-3">
          <div className="font-medium text-lg">{vocab.characters}</div>
          <div className="text-sm text-muted-foreground">
            {vocab.readings[0]}
          </div>
          <div className="text-sm">
            {vocab.meanings.slice(0, 2).join(", ")}
            {vocab.meanings.length > 2 && "..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
