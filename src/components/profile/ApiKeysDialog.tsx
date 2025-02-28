
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const ApiKeysDialog: React.FC<ApiKeysDialogProps> = ({
  open,
  onOpenChange,
  userId,
}) => {
  const [wanikaniKey, setWanikaniKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Create a memoized fetchApiKeys function
  const fetchApiKeys = useCallback(async () => {
    if (!open || !userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wanikani_key, openai_key, elevenlabs_key')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setWanikaniKey(data.wanikani_key || "");
        setOpenaiKey(data.openai_key || "");
        setElevenLabsKey(data.elevenlabs_key || "");
      }
    } catch (error: any) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error fetching API keys",
        description: error.message || "Failed to load your API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [open, userId, toast]);

  // Fetch API keys when the dialog opens
  useEffect(() => {
    let mounted = true;
    
    if (open && mounted) {
      fetchApiKeys();
    }
    
    return () => {
      mounted = false;
    };
  }, [open, fetchApiKeys]);

  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      setLoading(false);
    }
  }, [open]);

  // Update API keys
  const handleUpdateApiKeys = async () => {
    if (loading || !userId) return;
    
    if (!wanikaniKey || !openaiKey || !elevenLabsKey) {
      toast({
        title: "Missing required fields",
        description: "All API keys are required",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          wanikani_key: wanikaniKey,
          openai_key: openaiKey,
          elevenlabs_key: elevenLabsKey,
        })
        .eq('id', userId);
      
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      // Store API keys in localStorage for service usage
      localStorage.setItem("openai-api-key", openaiKey);
      localStorage.setItem("elevenlabs-api-key", elevenLabsKey);
      
      toast({
        title: "API keys updated",
        description: "Your API keys have been updated successfully",
      });
      
      // First set loading to false before closing the dialog
      setLoading(false);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating API keys",
        description: error.message || "Failed to update your API keys",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={loading ? undefined : onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit API Keys</DialogTitle>
          <DialogDescription>
            Update your API keys for WaniKani, OpenAI, and ElevenLabs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wanikani-key">WaniKani API Key</Label>
            <Input
              id="wanikani-key"
              type="password"
              value={wanikaniKey}
              onChange={(e) => setWanikaniKey(e.target.value)}
              placeholder="Enter your WaniKani API key"
              disabled={loading}
            />
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <a 
                href="https://www.wanikani.com/settings/personal_access_tokens" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                WaniKani API Key
              </a>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              disabled={loading}
            />
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                OpenAI API Key
              </a>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
            <Input
              id="elevenlabs-key"
              type="password"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
              disabled={loading}
            />
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <a 
                href="https://elevenlabs.io/app/settings/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                ElevenLabs API Key
              </a>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateApiKeys}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Keys"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeysDialog;
