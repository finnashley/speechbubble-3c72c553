
import React from "react";
import { WaniKaniUser } from "../lib/types";
import { MessageCircle } from "lucide-react";

interface HeaderProps {
  user?: WaniKaniUser | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="app-container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-medium">
            Speechbubble
          </h1>
          <div className="h-6 w-px bg-border mx-2"></div>
          <p className="text-sm text-muted-foreground">Sentence Practice</p>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="font-medium">{user.username}</p>
              <p className="text-muted-foreground">Level {user.level}</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <a 
              href="https://www.wanikani.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Use WaniKani API
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
