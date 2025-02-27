
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
    <div className="min-h-screen bg-background flex flex-col w-full overflow-x-hidden">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-grow py-6 w-full overflow-x-hidden">
        <div className="app-container h-full">
          {children}
        </div>
      </main>
      <footer className="border-t border-border py-6 w-full">
        <div className="app-container text-center text-sm text-muted-foreground space-y-2">
          <p>Speechbubble - Practice Japanese with your WaniKani vocabulary</p>
          <div className="text-xs max-w-2xl mx-auto">
            <p>
              Speechbubble is not affiliated with, associated with, or endorsed by Tofugu LLC or WaniKani. 
              All WaniKani content, including but not limited to vocabulary data, levels, and progress information, 
              is the property of Tofugu LLC. WaniKani® is a registered trademark of Tofugu LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

