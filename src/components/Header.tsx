
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
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="app-container h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-medium truncate">Speechbubble</h1>
          <div className="hidden xs:block h-6 w-px bg-border mx-1 md:mx-3 flex-shrink-0"></div>
          <p className="hidden xs:block text-sm text-muted-foreground truncate">Sentence Practice</p>
        </div>
        
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4 ml-2 flex-shrink-0">
            <div className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
              <span className="font-medium">{user.username}</span>
              <span className="mx-1 sm:mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">Level {user.level}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">Logout</span>
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
