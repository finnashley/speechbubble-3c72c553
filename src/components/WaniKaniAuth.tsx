
import React, { useState, useEffect } from "react";
import { fetchUser } from "../services/wanikaniService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WaniKaniUser } from "../lib/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface WaniKaniAuthProps {
  onAuthenticated: (apiKey: string, user: WaniKaniUser, openaiKey: string, elevenLabsKey: string) => void;
}

const WaniKaniAuth: React.FC<WaniKaniAuthProps> = ({ onAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          try {
            const wkUser = await fetchUser(data.wanikani_key);
            
            // Auto-authenticate with the stored keys
            onAuthenticated(
              data.wanikani_key, 
              wkUser, 
              data.openai_key || "", 
              data.elevenlabs_key || ""
            );
          } catch (err) {
            console.error("Error auto-authenticating:", err);
            setError("Could not authenticate with stored WaniKani API key. Please sign out and sign in again.");
          }
        } else {
          setError("No WaniKani API key found in your profile. Please sign out and sign in again with a valid key.");
        }
      } catch (err) {
        console.error("Error in loadProfileKeys:", err);
        setError("An error occurred while loading your profile. Please try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadProfileKeys();
  }, [user, onAuthenticated]);

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

  if (error) {
    return (
      <Card className="app-card max-w-md w-full mx-auto slide-up">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your API keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/auth';
            }} 
            className="w-full"
          >
            Sign Out and Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="app-card max-w-md w-full mx-auto slide-up">
      <CardHeader>
        <CardTitle>Authentication Complete</CardTitle>
        <CardDescription>
          If you're seeing this screen, there's an issue with the authentication flow. Please refresh the page or sign out and sign in again.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/auth';
          }} 
          className="w-full"
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WaniKaniAuth;
