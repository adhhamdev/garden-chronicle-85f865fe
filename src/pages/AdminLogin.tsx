import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { IslamicStar } from "@/components/Decorations";
import gardenLogo from "@/assets/garden-logo.png";
import { GARDEN } from "@/lib/garden";

export default function AdminLogin() {
  const nav = useNavigate();
  const { user, isAdmin } = useAuth();
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      nav("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen leaf-pattern flex items-center justify-center px-4 py-12 bg-gradient-cream">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6 text-primary">
          <img src={gardenLogo} alt="Garden logo" width={64} height={64} className="w-12 h-12 object-contain" />
          <div className="font-display text-2xl">{GARDEN.shortName}</div>
        </Link>
        <Card className="p-8 shadow-card border-border/60 relative overflow-hidden">
          <IslamicStar className="absolute -top-4 -right-4 w-20 h-20 text-accent/15" />
          <h1 className="font-display text-3xl text-primary mb-1 relative">Admin sign in</h1>
          <p className="text-sm text-muted-foreground mb-6 font-sub relative">
            Sign in to add updates, photos and logs.
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
              {loading ? "Please wait…" : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
