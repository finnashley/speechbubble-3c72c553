
import React from "react";
import { WaniKaniUser } from "../lib/types";
import { MessageCircle, LogIn, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

interface HeaderProps {
  user?: WaniKaniUser | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { user: authUser, signOut } = useAuth();

  const handleLogout = async () => {
    if (onLogout) onLogout();
    await signOut();
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-medium">Speechbubble</h1>
          <div className="h-6 w-px bg-border mx-1 md:mx-3"></div>
          <p className="text-sm text-muted-foreground">Infinite sentence practice</p>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="flex items-center gap-1"
            >
              <a href="https://www.wanikani.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                WaniKani
              </a>
            </Button>
            <ProfileDropdown onLogout={handleLogout} wanikaniUser={user} />
          </div>
        ) : authUser ? (
          <div className="flex items-center gap-2">
            <ProfileDropdown onLogout={handleLogout} />
          </div>
        ) : (
          <div className="flex items-center">
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
