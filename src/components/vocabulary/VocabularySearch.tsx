
import React from "react";
import { Input } from "@/components/ui/input";

interface VocabularySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const VocabularySearch: React.FC<VocabularySearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Search vocabulary..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};

export default VocabularySearch;
