
import React, { useState, useEffect } from "react";
import { SelectedVocabulary } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";

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
  const itemsPerPage = 30; // Show 30 items per page to reduce overwhelming display

  useEffect(() => {
    if (searchTerm) {
      const filtered = vocabulary.filter(
        (vocab) =>
          vocab.characters.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vocab.meanings.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredVocabulary(filtered);
      setCurrentPage(1); // Reset to first page when search changes
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
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectRandom(5)}
          >
            Random 5
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectRandom(10)}
          >
            Random 10
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            Select All ({filteredVocabulary.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
          >
            Clear
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} of {vocabulary.length} words selected | 
          Showing {startIndex + 1}-{endIndex} of {filteredVocabulary.length}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4 max-h-80 overflow-y-auto p-1">
          {currentItems.map((vocab) => (
            <div
              key={vocab.id}
              className={`border rounded-lg p-3 transition-colors ${
                selectedIds.includes(vocab.id)
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-start">
                <Checkbox
                  id={`vocab-${vocab.id}`}
                  checked={selectedIds.includes(vocab.id)}
                  onCheckedChange={() => handleToggleItem(vocab.id)}
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
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
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
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VocabularySelector;
