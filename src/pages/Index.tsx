
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import WaniKaniAuth from "@/components/WaniKaniAuth";
import VocabularySelector from "@/components/VocabularySelector";
import SentenceGenerator from "@/components/SentenceGenerator";
import HistorySection from "@/components/HistorySection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAllAvailableVocabulary } from "@/services/wanikaniService";
import { AppState, WaniKaniUser, SelectedVocabulary, GeneratedSentence } from "@/lib/types";
import { Loader2 } from "lucide-react";

const LOCAL_STORAGE_KEY = "speechbubble-app-state";

const Index = () => {
  const [appState, setAppState] = useState<AppState>({
    apiKey: null,
    user: null,
    vocabulary: [],
    generatedSentences: [],
  });
  
  const [selectedVocabulary, setSelectedVocabulary] = useState<SelectedVocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setAppState(parsedState);
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (appState.apiKey || appState.generatedSentences.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    }
  }, [appState]);

  const handleAuthenticated = async (apiKey: string, user: WaniKaniUser) => {
    setAppState((prev) => ({ ...prev, apiKey, user }));
    
    try {
      setIsLoading(true);
      const vocabulary = await fetchAllAvailableVocabulary(apiKey, user.level);
      setAppState((prev) => ({ ...prev, vocabulary }));
      toast({
        title: "Connected to WaniKani",
        description: `Loaded ${vocabulary.length} vocabulary items from your account (SRS started items only).`,
      });
    } catch (error) {
      console.error("Error loading vocabulary:", error);
      toast({
        title: "Error loading vocabulary",
        description: "Something went wrong while fetching your vocabulary.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAppState((prev) => ({
      ...prev,
      apiKey: null,
      user: null,
      vocabulary: [],
    }));
    setSelectedVocabulary([]);
  };

  const handleSelectionChange = (selected: SelectedVocabulary[]) => {
    setSelectedVocabulary(selected);
  };

  const handleSentencesGenerated = (newSentences: GeneratedSentence[]) => {
    setAppState((prev) => ({
      ...prev,
      generatedSentences: [...newSentences, ...prev.generatedSentences],
    }));
  };

  const handleClearHistory = () => {
    setAppState((prev) => ({ ...prev, generatedSentences: [] }));
    toast({
      title: "History cleared",
      description: "Your sentence history has been cleared.",
    });
  };

  const handleDeleteSentence = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      generatedSentences: prev.generatedSentences.filter(
        (sentence) => sentence.id !== id
      ),
    }));
  };

  return (
    <Layout>
      <div className="space-y-8">
        {!appState.apiKey || !appState.user ? (
          <>
            <div className="text-center my-12">
              <h1 className="text-4xl font-bold mb-2">Speechbubble</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Generate custom practice sentences using your WaniKani vocabulary
              </p>
            </div>
            
            <WaniKaniAuth onAuthenticated={handleAuthenticated} />
            
            {appState.generatedSentences.length > 0 && (
              <HistorySection
                sentences={appState.generatedSentences}
                onClearHistory={handleClearHistory}
                onDeleteSentence={handleDeleteSentence}
              />
            )}
          </>
        ) : (
          <>
            <Card className="app-card slide-up">
              <CardHeader>
                <CardTitle>Welcome to Speechbubble, {appState.user.username}</CardTitle>
                <CardDescription>
                  Level {appState.user.level} on WaniKani. You have access to {appState.vocabulary.length} vocabulary items.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select vocabulary words you want to practice with, then generate sentences that use those words.
                </p>
              </CardContent>
            </Card>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="ml-3 text-lg">Loading your vocabulary...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VocabularySelector
                  vocabulary={appState.vocabulary}
                  onSelectionChange={handleSelectionChange}
                />
                
                <SentenceGenerator
                  selectedVocabulary={selectedVocabulary}
                  onSentencesGenerated={handleSentencesGenerated}
                />
              </div>
            )}
            
            <HistorySection
              sentences={appState.generatedSentences}
              onClearHistory={handleClearHistory}
              onDeleteSentence={handleDeleteSentence}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
