
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ChevronDown, Key, LogOut, Trash2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [wanikaniKey, setWanikaniKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch current API keys on dialog open
  const handleOpenApiKeysDialog = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wanikani_key, openai_key, elevenlabs_key')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setWanikaniKey(data.wanikani_key || "");
        setOpenaiKey(data.openai_key || "");
        setElevenLabsKey(data.elevenlabs_key || "");
      }
    } catch (error: any) {
      toast({
        title: "Error fetching API keys",
        description: error.message || "Failed to load your API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowApiKeys(true);
    }
  };

  // Update API keys
  const handleUpdateApiKeys = async () => {
    if (!user) return;
    
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
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "API keys updated",
        description: "Your API keys have been updated successfully",
      });
      
      setShowApiKeys(false);
    } catch (error: any) {
      toast({
        title: "Error updating API keys",
        description: error.message || "Failed to update your API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (deleteConfirmation !== user.email) {
      toast({
        title: "Confirmation required",
        description: "Please type your email address exactly to confirm account deletion",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Then delete the user (user needs to reauthenticate first)
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your profile has been deleted. For complete account removal, please contact support.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message || "Failed to delete your account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteAccount(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{user.email}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" onClick={handleOpenApiKeysDialog}>
            <Key className="mr-2 h-4 w-4" />
            <span>Edit API Keys</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive" 
            onClick={() => setShowDeleteAccount(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* API Keys Dialog */}
      <Dialog open={showApiKeys} onOpenChange={setShowApiKeys}>
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
              onClick={() => setShowApiKeys(false)}
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

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your profile and associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              To confirm deletion, please type your email address: <span className="font-medium">{user.email}</span>
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
            <div className="space-y-2 pt-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteAccount(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading || deleteConfirmation !== user.email || !password}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;
