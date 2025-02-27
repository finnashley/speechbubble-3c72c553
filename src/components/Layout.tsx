
import React, { ReactNode } from "react";
import Header from "./Header";
import { WaniKaniUser } from "@/lib/types";

interface LayoutProps {
  children: ReactNode;
  user?: WaniKaniUser | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={user} onLogout={onLogout} />
      <main className="app-container flex-grow pt-10">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="app-container text-center text-sm text-muted-foreground">
          <p>Speechbubble - Practice Japanese with your WaniKani vocabulary</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
