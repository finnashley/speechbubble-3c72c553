
import React, { useState, useEffect } from "react";
import { fetchUser } from "../services/wanikaniService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WaniKaniUser } from "../lib/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WaniKaniAuthProps {
  onAuthenticated: (apiKey: string, user: WaniKaniUser, openaiKey: string, elevenLabsKey: string) => void;
}

const WaniKaniAuth: React.FC<WaniKaniAuthProps> = ({ onAuthenticated }) => {
  const [apiKey, setApiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalKeys, setShowAdditionalKeys] = useState(false);
  const { user } = useAuth();

  // Check for saved API keys in the profile and load them if they exist
  useEffect(() => {
    const loadProfileKeys = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('wanikani_key, openai_key, elevenlabs_key')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error loading profile keys:", error);
          setIsLoadingProfile(false);
          return;
        }
        
        // If we have a WaniKani key stored, try to auto-authenticate
        if (data?.wanikani_key) {
          setApiKey(data.wanikani_key);
          
          if (data?.openai_key) {
            setOpenaiKey(data.openai_key);
          }
          
          if (data?.elevenlabs_key) {
            setElevenLabsKey(data.elevenlabs_key);
          }
          
          // Try to auto-authenticate
          try {
            const wkUser = await fetchUser(data.wanikani_key);
            
            // If all API keys are present, auto-authenticate
            if (data.wanikani_key) {
              onAuthenticated(
                data.wanikani_key, 
                wkUser, 
                data.openai_key || "", 
                data.elevenlabs_key || ""
              );
            } else {
              // If we have a WaniKani key but missing other keys, show the additional keys form
              setShowAdditionalKeys(true);
            }
          } catch (err) {
            console.error("Error auto-authenticating:", err);
            // If auto-auth fails, just let the user enter the keys manually
          }
        }
      } catch (err) {
        console.error("Error in loadProfileKeys:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadProfileKeys();
  }, [user, onAuthenticated]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!apiKey.trim()) {
      setError("Please enter your WaniKani API key");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const wkUser = await fetchUser(apiKey);
      if (!showAdditionalKeys) {
        setShowAdditionalKeys(true);
        setIsLoading(false);
        return;
      }
      
      // Save the API keys to the user's profile if logged in
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
      
      onAuthenticated(apiKey, wkUser, openaiKey, elevenLabsKey);
    } catch (err) {
      setError("Authentication failed. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <Card className="app-card max-w-md w-full mx-auto slide-up">
        <CardHeader>
          <CardTitle>Loading Your Profile</CardTitle>
          <CardDescription>
            Checking for saved API keys...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="app-card max-w-md w-full mx-auto slide-up">
      <CardHeader>
        <CardTitle>{showAdditionalKeys ? "Setup Speechbubble" : "Connect to WaniKani"}</CardTitle>
        <CardDescription>
          {!showAdditionalKeys 
            ? "Enter your WaniKani API key to access your vocabulary."
            : "Great! Now enter your OpenAI and ElevenLabs API keys for additional features."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium">
              WaniKani API Key
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your WaniKani API V2 token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
              disabled={showAdditionalKeys}
            />
          </div>
          
          {showAdditionalKeys && (
            <>
              <div className="space-y-2">
                <label htmlFor="openai-key" className="text-sm font-medium">
                  OpenAI API Key
                </label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="elevenlabs-key" className="text-sm font-medium">
                  ElevenLabs API Key
                </label>
                <Input
                  id="elevenlabs-key"
                  type="password"
                  placeholder="Enter your ElevenLabs API key"
                  value={elevenLabsKey}
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!showAdditionalKeys && (
            <div className="text-sm text-muted-foreground">
              <p>
                You can find your API key in your{" "}
                <a
                  href="https://www.wanikani.com/settings/personal_access_tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                >
                  WaniKani API Dashboard
                </a>.
              </p>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : showAdditionalKeys ? "Complete Setup" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WaniKaniAuth;
