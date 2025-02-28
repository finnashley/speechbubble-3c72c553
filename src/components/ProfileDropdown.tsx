
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown, Key, LogOut, Trash2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { WaniKaniUser } from "@/lib/types";
import ApiKeysDialog from "./profile/ApiKeysDialog";
import DeleteAccountDialog from "./profile/DeleteAccountDialog";

interface ProfileDropdownProps {
  onLogout?: () => void;
  wanikaniUser?: WaniKaniUser | null;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onLogout, wanikaniUser }) => {
  const { user, signOut } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (onLogout) onLogout();
    await signOut();
    
    // Clear local storage
    localStorage.clear();
    
    navigate("/auth");
  };

  if (!user) return null;

  const displayName = wanikaniUser?.username || user.email;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{displayName}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setShowApiKeys(true)}>
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
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* API Keys Dialog */}
      {user && (
        <ApiKeysDialog 
          open={showApiKeys}
          onOpenChange={setShowApiKeys}
          userId={user.id}
        />
      )}

      {/* Delete Account Dialog */}
      {user && (
        <DeleteAccountDialog
          open={showDeleteAccount}
          onOpenChange={setShowDeleteAccount}
          user={user}
          signOut={signOut}
        />
      )}
    </>
  );
};

export default ProfileDropdown;
