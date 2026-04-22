import gardenLogo from "@/assets/garden-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/garden", label: "Garden Map" },
  { to: "/garden#directory", label: "All Trees" },
  { to: "/#about", label: "About" },
];

export const SiteHeader = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onDark = false; // header always uses backdrop blur on cream

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={gardenLogo}
            alt="Rabeeyunil Awwal Mango Garden logo"
            width={64}
            height={64}
            className="w-10 h-10 object-contain"
          />
          <div className="leading-tight">
            <div className="font-heading-arabic text-lg font-semibold text-primary">Rabeeyunil Awwal</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sub">Mango Garden</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-sub text-sm">
          {navItems.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-foreground/80 hover:text-primary transition-colors ${pathname === n.to ? "text-primary font-medium" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin/dashboard" className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/15 text-accent-foreground border border-accent/30 hover:bg-accent/25">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Link to="/admin" className="hidden md:inline text-xs text-primary/70 hover:text-primary font-sub">Admin</Link>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-primary" aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1 font-sub">
            {navItems.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2.5 text-foreground/80 hover:text-primary">
                {n.label}
              </Link>
            ))}
            {!user && <Link to="/admin" onClick={() => setOpen(false)} className="py-2.5 text-primary/70">Admin</Link>}
          </nav>
        </div>
      )}
    </header>
  );
};
