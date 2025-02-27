
import React from "react";
import { Button } from "@/components/ui/button";

interface VocabularySelectionControlsProps {
  onSelectRandom: (count: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  filteredVocabularyCount: number;
}

const VocabularySelectionControls: React.FC<VocabularySelectionControlsProps> = ({
  onSelectRandom,
  onSelectAll,
  onClearSelection,
  filteredVocabularyCount,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSelectRandom(5)}
      >
        Random 5
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSelectRandom(10)}
      >
        Random 10
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
      >
        Select All ({filteredVocabularyCount})
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
      >
        Clear
      </Button>
    </div>
  );
};

export default VocabularySelectionControls;
