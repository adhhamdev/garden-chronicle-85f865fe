import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MangoLeaf } from "./MangoLeaf";
import { LogOut, ShieldCheck } from "lucide-react";

export const SiteHeader = () => {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-leaf flex items-center justify-center text-primary-foreground shadow-soft">
            <MangoLeaf className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold text-primary">Rabeeyunil Awwal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mango Garden</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent-foreground border border-accent/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1.5" /> Sign out
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Admin sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
