
import React from "react";
import { SelectedVocabulary } from "@/lib/types";
import VocabularyCard from "./VocabularyCard";

interface VocabularyGridProps {
  vocabularyItems: SelectedVocabulary[];
  selectedIds: number[];
  onToggleItem: (id: number) => void;
}

const VocabularyGrid: React.FC<VocabularyGridProps> = ({
  vocabularyItems,
  selectedIds,
  onToggleItem,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4 max-h-80 overflow-y-auto p-1 vocab-grid">
      {vocabularyItems.map((vocab) => (
        <VocabularyCard
          key={vocab.id}
          vocab={vocab}
          isSelected={selectedIds.includes(vocab.id)}
          onToggle={onToggleItem}
        />
      ))}
    </div>
  );
};

export default VocabularyGrid;
