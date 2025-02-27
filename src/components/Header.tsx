
import React from "react";
import { WaniKaniUser } from "../lib/types";
import { LogOut, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  user?: WaniKaniUser | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-medium">Speechbubble</h1>
          <div className="h-6 w-px bg-border mx-1 md:mx-3"></div>
          <p className="text-sm text-muted-foreground">Sentence Practice</p>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{user.username}</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">Level {user.level}</span>
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
              <span className="text-sm text-muted-foreground">Profile</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
