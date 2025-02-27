
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
      <div className="app-container py-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-medium">
            Speechbubble
          </h1>
          <div className="h-6 w-px bg-border mx-4"></div>
          <p className="text-base text-muted-foreground">Sentence Practice</p>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-6">
            <div className="text-base flex items-center gap-3">
              <p className="font-medium">{user.username}</p>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">Level {user.level}</p>
            </div>
            <Button 
              variant="outline" 
              size="default" 
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex items-center px-4 py-3 bg-secondary rounded-lg">
              <User className="h-5 w-5 text-muted-foreground mr-3" />
              <span className="text-base text-muted-foreground">Profile</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
