
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wanikaniKey, setWanikaniKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !wanikaniKey) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (WaniKani API key is required)",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;

      // If signup was successful and we have a user, create their profile with API keys
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            wanikani_key: wanikaniKey,
            openai_key: openaiKey,
            elevenlabs_key: elevenLabsKey
          });
          
        if (profileError) {
          throw profileError;
        }
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. You can now sign in.",
      });
      
      // Switch to sign in tab
      setActiveTab("signin");
      // Clear the signup form
      setWanikaniKey("");
      setOpenaiKey("");
      setElevenLabsKey("");
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-medium">Speechbubble</h1>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Speechbubble</CardTitle>
            <CardDescription>
              Learn Japanese through interactive practice
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">API Keys (required)</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wanikani-key">
                        WaniKani API Key <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="wanikani-key"
                        type="password"
                        placeholder="Enter your WaniKani API key"
                        value={wanikaniKey}
                        onChange={(e) => setWanikaniKey(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        <a 
                          href="https://www.wanikani.com/settings/personal_access_tokens" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          Get your WaniKani API key
                        </a>
                      </p>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="Enter your OpenAI API key"
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                      <Input
                        id="elevenlabs-key"
                        type="password"
                        placeholder="Enter your ElevenLabs API key"
                        value={elevenLabsKey}
                        onChange={(e) => setElevenLabsKey(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
