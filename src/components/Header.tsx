
import React from "react";
import { WaniKaniUser } from "../lib/types";
import { LogOut, MessageCircle, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  user?: WaniKaniUser | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="app-container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-medium">
            Speechbubble
          </h1>
          <div className="h-6 w-px bg-border mx-2"></div>
          <p className="text-sm text-muted-foreground">Sentence Practice</p>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="text-sm flex items-center gap-2">
              <p className="font-medium">{user.username}</p>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">Level {user.level}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex items-center px-3 py-2 bg-secondary rounded-lg">
              <User className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Profile</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
