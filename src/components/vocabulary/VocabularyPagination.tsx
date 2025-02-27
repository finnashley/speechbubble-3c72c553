
import React from "react";
import { Button } from "@/components/ui/button";

interface VocabularyPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const VocabularyPagination: React.FC<VocabularyPaginationProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default VocabularyPagination;
