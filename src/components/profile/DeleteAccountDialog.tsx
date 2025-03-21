
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
  };
  signOut: () => Promise<void>;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onOpenChange, user, signOut }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Clean up function to be called after successful deletion
  const cleanupAfterDeletion = async () => {
    try {
      // Sign the user out after account deletion
      await signOut();
      
      // Navigate to the authentication page and pass state
      navigate("/auth", { state: { fromAccountDeletion: true } });
    } catch (error) {
      console.error("Error during post-deletion cleanup:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Call the delete_user function that runs with RLS bypass
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        throw error;
      }
      
      // Mark as deleted to prevent further API calls
      setIsDeleted(true);
      
      // Close the dialog first
      onOpenChange(false);
      
      // Then perform cleanup operations
      setTimeout(cleanupAfterDeletion, 100);
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    // Simply close the dialog without any side effects
    onOpenChange(false);
  };

  // If the account is already deleted, don't render the dialog
  // to prevent any further API calls
  if (isDeleted) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Only allow changing if not loading and if we're closing the dialog
        if (!loading && (newOpen === false || !open)) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent 
        onInteractOutside={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
