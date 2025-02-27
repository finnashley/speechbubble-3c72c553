
import React from "react";

interface VocabularyStatsProps {
  selectedCount: number;
  totalCount: number;
  startIndex: number;
  endIndex: number;
  filteredCount: number;
}

const VocabularyStats: React.FC<VocabularyStatsProps> = ({
  selectedCount,
  totalCount,
  startIndex,
  endIndex,
  filteredCount,
}) => {
  return (
    <div className="text-sm text-muted-foreground">
      {selectedCount} of {totalCount} words selected | 
      Showing {startIndex + 1}-{endIndex} of {filteredCount}
    </div>
  );
};

export default VocabularyStats;
