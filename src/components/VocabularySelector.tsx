
import React, { useState, useEffect } from "react";
import { SelectedVocabulary } from "../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";
import VocabularySearch from "./vocabulary/VocabularySearch";
import VocabularySelectionControls from "./vocabulary/VocabularySelectionControls";
import VocabularyStats from "./vocabulary/VocabularyStats";
import VocabularyGrid from "./vocabulary/VocabularyGrid";
import VocabularyPagination from "./vocabulary/VocabularyPagination";

interface VocabularySelectorProps {
  vocabulary: SelectedVocabulary[];
  onSelectionChange: (selected: SelectedVocabulary[]) => void;
}

const VocabularySelector: React.FC<VocabularySelectorProps> = ({
  vocabulary,
  onSelectionChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVocabulary, setFilteredVocabulary] = useState<SelectedVocabulary[]>(vocabulary);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    if (searchTerm) {
      const filtered = vocabulary.filter(
        (vocab) =>
          vocab.characters.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vocab.meanings.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredVocabulary(filtered);
      setCurrentPage(1);
    } else {
      setFilteredVocabulary(vocabulary);
    }
  }, [searchTerm, vocabulary]);

  useEffect(() => {
    const selectedVocabulary = vocabulary.filter((vocab) =>
      selectedIds.includes(vocab.id)
    );
    onSelectionChange(selectedVocabulary);
  }, [selectedIds, vocabulary, onSelectionChange]);

  const handleToggleItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectRandom = (count: number) => {
    const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
    const randomIds = shuffled.slice(0, count).map((vocab) => vocab.id);
    setSelectedIds(randomIds);
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredVocabulary.map((vocab) => vocab.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Pagination
  const totalPages = Math.ceil(filteredVocabulary.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredVocabulary.length);
  const currentItems = filteredVocabulary.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className="app-card w-full slide-up">
      <CardHeader>
        <div className="flex items-center">
          <Book className="mr-2 h-5 w-5 text-primary" />
          <CardTitle>Select Vocabulary</CardTitle>
        </div>
        <CardDescription>
          Choose the vocabulary words to use in your practice sentences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <VocabularySearch 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
        <VocabularySelectionControls
          onSelectRandom={handleSelectRandom}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          filteredVocabularyCount={filteredVocabulary.length}
        />
        
        <VocabularyStats 
          selectedCount={selectedIds.length}
          totalCount={vocabulary.length}
          startIndex={startIndex}
          endIndex={endIndex}
          filteredCount={filteredVocabulary.length}
        />
        
        <VocabularyGrid 
          vocabularyItems={currentItems}
          selectedIds={selectedIds}
          onToggleItem={handleToggleItem}
        />
        
        <VocabularyPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={prevPage}
          onNextPage={nextPage}
        />
      </CardContent>
    </Card>
  );
};

export default VocabularySelector;
