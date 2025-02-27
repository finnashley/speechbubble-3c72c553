
import React, { useState } from "react";
import { fetchUser } from "../services/wanikaniService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WaniKaniUser } from "../lib/types";

interface WaniKaniAuthProps {
  onAuthenticated: (apiKey: string, user: WaniKaniUser, openaiKey: string, elevenLabsKey: string) => void;
}

const WaniKaniAuth: React.FC<WaniKaniAuthProps> = ({ onAuthenticated }) => {
  const [apiKey, setApiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalKeys, setShowAdditionalKeys] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!apiKey.trim()) {
      setError("Please enter your WaniKani API key");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await fetchUser(apiKey);
      if (!showAdditionalKeys) {
        setShowAdditionalKeys(true);
        setIsLoading(false);
        return;
      }
      
      onAuthenticated(apiKey, user, openaiKey, elevenLabsKey);
    } catch (err) {
      setError("Authentication failed. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="app-card max-w-md w-full mx-auto slide-up">
      <CardHeader>
        <CardTitle>Connect to WaniKani</CardTitle>
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
