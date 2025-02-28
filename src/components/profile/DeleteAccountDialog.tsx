
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
  };
  signOut: () => Promise<void>;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
  user,
  signOut,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Delete full account
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
      // First verify the user's password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      
      if (signInError) {
        throw new Error("Password verification failed. Please check your password and try again.");
      }
      
      // Try to use the RPC function to delete user
      const { error: userDeleteError } = await supabase.rpc('delete_user');
      
      if (userDeleteError) {
        // If RPC fails, fallback to just signing out
        await signOut();
        throw new Error("Could not fully delete account. Please contact support for account deletion.");
      }
      
      // Clear local storage
      localStorage.clear();
      
      toast({
        title: "Account deleted",
        description: "Your account has been fully deleted from our system.",
      });
      
      // Redirect to auth page
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message || "Failed to delete your account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Your account and all associated data will be permanently deleted.
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
            onClick={() => onOpenChange(false)}
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
  );
};

export default DeleteAccountDialog;
