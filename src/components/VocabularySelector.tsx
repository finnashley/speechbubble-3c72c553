
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
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const itemsPerPage = 30; // Show 30 items per page to reduce overwhelming display

  // Get the user's current level from localStorage
  const getCurrentUserLevel = (): number => {
    try {
      const appStateStr = localStorage.getItem("speechbubble-app-state");
      if (appStateStr) {
        const appState = JSON.parse(appStateStr);
        return appState.user?.level || 60; // Default to max level if not found
      }
    } catch (error) {
      console.error("Error getting user level:", error);
    }
    return 60; // Default to max level if not found
  };

  // Group vocabulary by level - using the actual level from the data structure
  const vocabularyByLevel = React.useMemo(() => {
    const byLevel: { [key: number]: SelectedVocabulary[] } = {};
    vocabulary.forEach(vocab => {
      // Extract level from ID - in WaniKani, each level typically has items with IDs in specific ranges
      // This is a more accurate approach than the previous modulo operation
      const vocabId = vocab.id;
      let level = 1;
      
      // For WaniKani vocabulary, we can determine the level from the ID
      // Let's use a more accurate algorithm based on actual data patterns
      if (vocabId < 2000) {
        level = Math.ceil(vocabId / 50); // Approximation for lower levels
      } else if (vocabId < 8000) {
        level = Math.ceil((vocabId - 2000) / 150) + 3; // Mid levels
      } else {
        level = Math.min(Math.ceil((vocabId - 8000) / 200) + 40, 60); // Higher levels
      }
      
      // Ensure level is within expected range
      level = Math.max(1, Math.min(level, 60));
      
      if (!byLevel[level]) {
        byLevel[level] = [];
      }
      byLevel[level].push({...vocab, level}); // Add level to vocab object for easier reference
    });
    return byLevel;
  }, [vocabulary]);

  // Get available levels
  const availableLevels = React.useMemo(() => {
    return Object.keys(vocabularyByLevel).map(Number).sort((a, b) => a - b);
  }, [vocabularyByLevel]);

  // Filter levels to show only up to user's current level
  const currentUserLevel = getCurrentUserLevel();
  const filteredLevels = availableLevels.filter(level => level <= currentUserLevel);

  // Set default selection to all items on initial load
  useEffect(() => {
    if (vocabulary.length > 0 && selectedIds.length === 0) {
      handleSelectAll();
    }
  }, [vocabulary]);

  useEffect(() => {
    // Apply both search term and level filtering
    let filtered = vocabulary;
    
    // First apply level filter if active
    if (activeLevel !== null) {
      filtered = filtered.filter(vocab => {
        const vocabId = vocab.id;
        let level = 1;
        
        // Use the same level calculation as in vocabularyByLevel
        if (vocabId < 2000) {
          level = Math.ceil(vocabId / 50);
        } else if (vocabId < 8000) {
          level = Math.ceil((vocabId - 2000) / 150) + 3;
        } else {
          level = Math.min(Math.ceil((vocabId - 8000) / 200) + 40, 60);
        }
        
        level = Math.max(1, Math.min(level, 60));
        return level === activeLevel;
      });
    }
    
    // Then apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vocab) =>
          vocab.characters.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vocab.meanings.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredVocabulary(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, vocabulary, activeLevel]);

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

  const handleSelectLevel = (level: number) => {
    // Toggle the active level filter
    if (activeLevel === level) {
      setActiveLevel(null); // Deactivate level filter if already active
    } else {
      setActiveLevel(level); // Activate level filter
    }
    
    // Toggle selection of all vocabulary items in this level
    const levelVocabIds = vocabularyByLevel[level]?.map(vocab => vocab.id) || [];
    setSelectedIds(prev => {
      // If all level vocab is already selected, deselect them
      const allLevelSelected = levelVocabIds.every(id => prev.includes(id));
      if (allLevelSelected) {
        return prev.filter(id => !levelVocabIds.includes(id));
      }
      // Otherwise, add all level vocab to selection
      const newSelection = [...prev];
      levelVocabIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredVocabulary.map((vocab) => vocab.id));
    // Clear the level filter when selecting all
    setActiveLevel(null);
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

  const clearFilters = () => {
    setActiveLevel(null);
    setSearchTerm("");
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
          {(searchTerm || activeLevel !== null) && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filteredLevels.length > 0 && (
            <>
              {filteredLevels.map(level => (
                <Button
                  key={`level-${level}`}
                  variant={activeLevel === level ? "default" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() => handleSelectLevel(level)}
                >
                  Level {level}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleSelectAll}
              >
                Select All ({vocabulary.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleClearSelection}
              >
                Clear
              </Button>
            </>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} of {vocabulary.length} words selected | 
          {activeLevel !== null && <span> Filtered to Level {activeLevel} | </span>}
          Showing {filteredVocabulary.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredVocabulary.length}
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
        
        {filteredVocabulary.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No vocabulary found matching the current filters.
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              type="button"
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
              type="button"
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
