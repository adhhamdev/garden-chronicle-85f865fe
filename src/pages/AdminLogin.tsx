import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MangoLeaf, IslamicStar } from "@/components/Decorations";
import { GARDEN } from "@/lib/garden";

export default function AdminLogin() {
  const nav = useNavigate();
  const { user, isAdmin } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin · Rabeeyunil Awwal Mango Garden";
    if (user && isAdmin) nav("/admin/dashboard");
  }, [user, isAdmin, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` }
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        nav("/admin/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen leaf-pattern flex items-center justify-center px-4 py-12 bg-gradient-cream">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary">
          <div className="w-10 h-10 rounded-full bg-gradient-leaf flex items-center justify-center text-primary-foreground">
            <MangoLeaf className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl">{GARDEN.shortName}</div>
        </Link>
        <Card className="p-8 shadow-card border-border/60 relative overflow-hidden">
          <IslamicStar className="absolute -top-4 -right-4 w-20 h-20 text-accent/15" />
          <h1 className="font-display text-3xl text-primary mb-1 relative">{mode === "signin" ? "Admin sign in" : "Create admin account"}</h1>
          <p className="text-sm text-muted-foreground mb-6 font-sub relative">
            {mode === "signin"
              ? "Sign in to add updates, photos and logs."
              : "The first registered user becomes the garden administrator."}
          </p>
          <form onSubmit={submit} className="space-y-4 relative">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-sub">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-sub">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 rounded-full font-sub" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 text-sm text-muted-foreground hover:text-primary w-full text-center font-sub"
          >
            {mode === "signin" ? "First time here? Create the admin account →" : "Already have an account? Sign in →"}
          </button>
        </Card>
      </div>
    </div>
  );
}
