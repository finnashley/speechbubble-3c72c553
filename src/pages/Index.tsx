
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import WaniKaniAuth from "@/components/WaniKaniAuth";
import VocabularySelector from "@/components/VocabularySelector";
import TestMode from "@/components/TestMode";
import TestSetup from "@/components/TestSetup";
import HistorySection from "@/components/HistorySection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAllAvailableVocabulary } from "@/services/wanikaniService";
import { generateSentences } from "@/services/openaiService";
import { AppState, WaniKaniUser, SelectedVocabulary, GeneratedSentence, GrammarLevel, TestType } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const LOCAL_STORAGE_KEY = "speechbubble-app-state";
const TEST_TYPE_STORAGE = "testType";

const Index = () => {
  const [appState, setAppState] = useState<AppState>({
    apiKey: null,
    user: null,
    vocabulary: [],
    generatedSentences: [],
  });
  
  const [selectedVocabulary, setSelectedVocabulary] = useState<SelectedVocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testSentences, setTestSentences] = useState<GeneratedSentence[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          setProfileLoaded(true);
          return;
        }

        // If we have WaniKani API key stored, initialize the app
        if (data && data.wanikani_key) {
          const openaiKey = data.openai_key || "";
          const elevenLabsKey = data.elevenlabs_key || "";
          
          // Store API keys in localStorage for service usage
          localStorage.setItem("openai-api-key", openaiKey);
          localStorage.setItem("elevenlabs-api-key", elevenLabsKey);
          
          console.log("Profile loaded with API keys. Initializing WaniKani...");
          
          // Initialize WaniKani
          try {
            await handleWaniKaniAuth(data.wanikani_key, null, openaiKey, elevenLabsKey);
          } catch (error) {
            console.error("Error initializing WaniKani:", error);
          }
        } else {
          console.log("Profile found but no WaniKani API key present");
        }
      } catch (error) {
        console.error("Error in loadUserProfile:", error);
      } finally {
        setIsLoading(false);
        setProfileLoaded(true);
      }
    };

    if (user && !profileLoaded) {
      loadUserProfile();
    }
  }, [user, profileLoaded]);

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

  const handleWaniKaniAuth = async (
    apiKey: string, 
    wkUser: WaniKaniUser | null = null,
    openaiKey: string = "", 
    elevenLabsKey: string = ""
  ) => {
    setIsLoading(true);
    
    try {
      // If wkUser is not provided, fetch WaniKani user info
      let userData: WaniKaniUser;
      if (!wkUser) {
        const response = await fetch("https://api.wanikani.com/v2/user", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch WaniKani user");
        }
        
        const userResponse = await response.json();
        userData = {
          id: userResponse.data.id,
          username: userResponse.data.username,
          level: userResponse.data.level,
          profile_url: userResponse.data.profile_url,
        };
      } else {
        userData = wkUser;
      }
      
      setAppState((prev) => ({ ...prev, apiKey, user: userData }));
      
      // If authenticated user exists, save the API keys to their profile
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            wanikani_key: apiKey,
            openai_key: openaiKey,
            elevenlabs_key: elevenLabsKey
          }, { onConflict: 'id' });
          
        if (error) {
          console.error("Error updating profile:", error);
        }
      }
      
      // Store API keys in localStorage for service usage
      localStorage.setItem("openai-api-key", openaiKey);
      localStorage.setItem("elevenlabs-api-key", elevenLabsKey);
      
      // Fetch vocabulary
      const vocabulary = await fetchAllAvailableVocabulary(apiKey, userData.level);
      setAppState((prev) => ({ ...prev, vocabulary }));
      
      // Remove the toast notification
    } catch (error) {
      console.error("Error in handleWaniKaniAuth:", error);
      toast({
        title: "Error connecting to WaniKani",
        description: "Failed to authenticate with WaniKani. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticated = async (
    apiKey: string, 
    user: WaniKaniUser, 
    openaiKey: string, 
    elevenLabsKey: string
  ) => {
    // Update app state with the API key and user info
    setAppState((prev) => ({ ...prev, apiKey, user }));
    
    // Store OpenAI and ElevenLabs keys in localStorage
    localStorage.setItem("openai-api-key", openaiKey);
    localStorage.setItem("elevenlabs-api-key", elevenLabsKey);
    
    // If authenticated user exists, save the API keys to their profile
    if (user) {
      console.log("Saving API keys to profile...");
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          wanikani_key: apiKey,
          openai_key: openaiKey,
          elevenlabs_key: elevenLabsKey
        }, { onConflict: 'id' });
        
      if (error) {
        console.error("Error updating profile:", error);
      } else {
        console.log("Profile updated successfully");
      }
    }
    
    try {
      setIsLoading(true);
      const vocabulary = await fetchAllAvailableVocabulary(apiKey, user.level);
      setAppState((prev) => ({ ...prev, vocabulary }));
      // Removed the toast notification here
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
    setAppState({
      apiKey: null,
      user: null,
      vocabulary: [],
      generatedSentences: [],
    });
    setSelectedVocabulary([]);
    setTestSentences([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("openai-api-key");
    localStorage.removeItem("elevenlabs-api-key");
    localStorage.removeItem(TEST_TYPE_STORAGE);
    setProfileLoaded(false);
    
    toast({
      title: "Logged out",
      description: "You have been logged out. Your local session has been cleared.",
    });
  };

  const handleSelectionChange = (selected: SelectedVocabulary[]) => {
    setSelectedVocabulary(selected);
  };

  const handleStartTest = async (count: number, grammarLevel: GrammarLevel, testType: TestType, speakingSpeed?: string) => {
    if (selectedVocabulary.length === 0) {
      toast({
        title: "No vocabulary selected",
        description: "Please select at least one vocabulary word.",
        variant: "destructive",
      });
      return;
    }

    // Save test type to localStorage for the test mode component
    localStorage.setItem(TEST_TYPE_STORAGE, testType);

    // Store speaking speed in localStorage for the audio generator
    if (speakingSpeed) {
      localStorage.setItem("speechSpeed", speakingSpeed);
    }

    try {
      // Special handling for English to Japanese vocabulary tests
      if (testType === "englishToJapanese") {
        // For vocab-only tests, we generate test data directly from selected vocabulary
        const enhancedSentences = await generateSentences(selectedVocabulary, count, grammarLevel, testType);
        
        setTestSentences(enhancedSentences);
        setIsTestMode(true);
        
        setAppState((prev) => ({
          ...prev,
          generatedSentences: [...enhancedSentences, ...prev.generatedSentences],
        }));
        
        toast({
          title: "Test ready",
          description: `Generated ${enhancedSentences.length} vocabulary items for your practice test.`,
        });
      } else {
        // For sentence-based tests, use the OpenAI service
        const sentences = await generateSentences(selectedVocabulary, count, grammarLevel, testType);
        
        // Add testType to each sentence
        const enhancedSentences = sentences.map(sentence => ({
          ...sentence,
          testType
        }));
        
        setTestSentences(enhancedSentences);
        setIsTestMode(true);
        
        setAppState((prev) => ({
          ...prev,
          generatedSentences: [...enhancedSentences, ...prev.generatedSentences],
        }));
        
        toast({
          title: "Test ready",
          description: `Generated ${sentences.length} sentences for your practice test.`,
        });
      }
    } catch (error) {
      console.error("Error generating sentences:", error);
      toast({
        title: "Error",
        description: "Failed to generate test content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExitTest = () => {
    setIsTestMode(false);
    setTestSentences([]);
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
    <Layout user={appState.user} onLogout={handleLogout}>
      {!appState.apiKey || !appState.user ? (
        <>
          <div className="text-center my-12">
            <h1 className="text-4xl font-bold mb-4">Speechbubble</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate custom practice sentences using your WaniKani vocabulary
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading your profile...</span>
            </div>
          ) : (
            <WaniKaniAuth onAuthenticated={handleAuthenticated} />
          )}
          
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
          {!isTestMode && (
            <Card className="app-card slide-up">
              <CardHeader>
                <CardTitle>Welcome to Speechbubble, {appState.user.username}</CardTitle>
                <CardDescription>
                  Level {appState.user.level} on WaniKani. You have access to {appState.vocabulary.length} vocabulary items.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select vocabulary words you want to practice with, then start a test to practice with generated sentences or individual vocabulary.
                </p>
              </CardContent>
            </Card>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading your vocabulary...</span>
            </div>
          ) : isTestMode ? (
            <TestMode 
              sentences={testSentences}
              onExitTest={handleExitTest}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VocabularySelector
                vocabulary={appState.vocabulary}
                onSelectionChange={handleSelectionChange}
              />
              
              <TestSetup
                selectedVocabulary={selectedVocabulary}
                onStartTest={handleStartTest}
              />
            </div>
          )}
          
          {!isTestMode && (
            <HistorySection
              sentences={appState.generatedSentences}
              onClearHistory={handleClearHistory}
              onDeleteSentence={handleDeleteSentence}
              showOnlyIfHasHistory={true}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default Index;
