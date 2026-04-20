import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { type Tree, type TreeUpdate, type HealthStatus, healthBadge, formatDate, GARDEN } from "@/lib/garden";
import { SiteHeader } from "@/components/SiteHeader";
import { MangoLeaf } from "@/components/MangoLeaf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { ArrowLeft, Camera, ClipboardEdit, Download, Image as ImageIcon, Leaf, Loader2, QrCode, Ruler, Sprout } from "lucide-react";

export default function TreeProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, user } = useAuth();
  const [tree, setTree] = useState<Tree | null>(null);
  const [updates, setUpdates] = useState<TreeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const qrCardRef = useRef<HTMLDivElement>(null);

  // Edit form state
  const [editOpen, setEditOpen] = useState(false);
  const [updateType, setUpdateType] = useState("note");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Spec form
  const [specsOpen, setSpecsOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [canopy, setCanopy] = useState("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("Good");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [treeRes, updRes] = await Promise.all([
      supabase.from("trees").select("*").eq("id", id).maybeSingle(),
      supabase.from("tree_updates").select("*").eq("tree_id", id).order("created_at", { ascending: false }),
    ]);
    if (treeRes.data) {
      setTree(treeRes.data as Tree);
      setHeight(treeRes.data.height ?? "");
      setCanopy(treeRes.data.canopy_diameter ?? "");
      setHealthStatus(treeRes.data.health_status as HealthStatus);
    }
    if (updRes.data) setUpdates(updRes.data as TreeUpdate[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (tree) {
      document.title = `${tree.id} · Line ${tree.line_position} · Mango Tree Profile`;
      const meta = document.querySelector('meta[name="description"]') ?? (() => {
        const m = document.createElement("meta"); m.setAttribute("name","description"); document.head.appendChild(m); return m;
      })();
      meta.setAttribute("content", `Tree ${tree.id} (${tree.line_position}) — Tom JC mango tree profile, photos, health logs and harvest record at Rabeeyunil Awwal Mango Garden.`);
    }
  }, [tree]);

  const photos = updates.filter(u => u.photo_url).sort((a,b) =>
    (b.photo_date ?? b.created_at).localeCompare(a.photo_date ?? a.created_at));

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tree || !user) return;
    setBusy(true);
    try {
      let photo_url: string | null = null;
      let photo_date: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${tree.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("tree-photos").upload(path, photoFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("tree-photos").getPublicUrl(path);
        photo_url = pub.publicUrl;
        photo_date = new Date().toISOString().slice(0, 10);
      }
      const { error } = await supabase.from("tree_updates").insert({
        tree_id: tree.id,
        update_type: photo_url ? "photo" : updateType,
        note: note || null,
        photo_url, photo_date,
        created_by: user.id,
      });
      if (error) throw error;

      // Sync date fields
      const today = new Date().toISOString().slice(0, 10);
      const patch: any = {};
      if (updateType === "fertilization") patch.last_fertilization = today;
      if (updateType === "pruning") patch.last_pruning = today;
      if (Object.keys(patch).length) await supabase.from("trees").update(patch).eq("id", tree.id);

      toast.success("Update saved");
      setNote(""); setPhotoFile(null); setUpdateType("note"); setEditOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const saveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tree) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("trees").update({
        height: height || null,
        canopy_diameter: canopy || null,
        health_status: healthStatus,
      }).eq("id", tree.id);
      if (error) throw error;
      await supabase.from("tree_updates").insert({
        tree_id: tree.id,
        update_type: "measurement",
        note: `Specs updated · Height: ${height || "—"} · Canopy: ${canopy || "—"} · Health: ${healthStatus}`,
        created_by: user!.id,
      });
      toast.success("Specifications updated");
      setSpecsOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadQR = async () => {
    if (!qrCardRef.current) return;
    const canvas = await html2canvas(qrCardRef.current, { scale: 3, backgroundColor: "#fdf6e3" });
    const link = document.createElement("a");
    link.download = `${tree?.id}-qr-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (!tree) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Tree not found.</p>
        <Button onClick={() => nav("/")}>Back to garden</Button>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/tree/${tree.id}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-4xl py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back to garden</Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10 pb-8 border-b border-border/60">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="border-primary/20 text-primary font-mono">
                Line {tree.line_position}
              </Badge>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${healthBadge(tree.health_status)}`}>
                ● {tree.health_status}
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-primary leading-none">{tree.id}</h1>
            <p className="text-muted-foreground mt-3">Tom JC · Planted {formatDate(tree.planting_date)}</p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <ClipboardEdit className="w-4 h-4 mr-1.5" /> Add update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="font-display text-2xl">Add update for {tree.id}</DialogTitle></DialogHeader>
                  <form onSubmit={submitUpdate} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Update type</Label>
                      <Select value={updateType} onValueChange={setUpdateType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">General note</SelectItem>
                          <SelectItem value="fertilization">Fertilization</SelectItem>
                          <SelectItem value="pruning">Pruning</SelectItem>
                          <SelectItem value="health">Health observation</SelectItem>
                          <SelectItem value="harvest">Harvest</SelectItem>
                          <SelectItem value="measurement">Measurement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Photo (optional)</Label>
                      <Input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Note</Label>
                      <Textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Describe what you observed or did…" />
                    </div>
                    <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90">
                      {busy ? "Saving…" : "Save update"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Ruler className="w-4 h-4 mr-1.5" /> Edit specs</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="font-display text-2xl">Edit specifications</DialogTitle></DialogHeader>
                  <form onSubmit={saveSpecs} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Height</Label>
                      <Input value={height} onChange={e => setHeight(e.target.value)} placeholder='e.g. 1&#39;9" (54cm)' />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Canopy diameter</Label>
                      <Input value={canopy} onChange={e => setCanopy(e.target.value)} placeholder="e.g. 80cm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Health status</Label>
                      <Select value={healthStatus} onValueChange={(v) => setHealthStatus(v as HealthStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Monitor">Monitor</SelectItem>
                          <SelectItem value="Attention">Attention</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90">
                      {busy ? "Saving…" : "Save"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* 1. VISUAL */}
          <Card className="p-6 md:p-8 border-border/60 shadow-soft">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2"><Camera className="w-5 h-5 text-accent" /> Visual documentation</h2>
            {photos.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg py-14 text-center text-muted-foreground">
                <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No photos yet.{isAdmin && " Add an update with a photo to begin the chronology."}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(p => (
                  <div key={p.id} className="rounded-lg overflow-hidden border border-border/60 bg-muted">
                    <img src={p.photo_url!} alt={`${tree.id} on ${formatDate(p.photo_date)}`} className="w-full aspect-square object-cover" loading="lazy" />
                    <div className="p-2.5 text-xs text-muted-foreground bg-card">
                      {formatDate(p.photo_date ?? p.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 2. SPECS */}
          <Card className="p-6 md:p-8 border-border/60 shadow-soft">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2"><Sprout className="w-5 h-5 text-accent" /> Tree specifications</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ["Variety", tree.variety],
                ["Planting date", formatDate(tree.planting_date)],
                ["Current height", tree.height ?? "—"],
                ["Canopy diameter", tree.canopy_diameter ?? "—"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-border/40">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* 3. HEALTH */}
          <Card className="p-6 md:p-8 border-border/60 shadow-soft">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2"><Leaf className="w-5 h-5 text-accent" /> Health & maintenance</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
              {[
                ["Health status", tree.health_status],
                ["Last fertilization", formatDate(tree.last_fertilization)],
                ["Last pruning", formatDate(tree.last_pruning)],
                ["Pest / disease", tree.pest_observations ?? "None recorded"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-border/40">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>

            {updates.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/60">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Activity timeline</h3>
                <ol className="relative border-l-2 border-leaf/30 ml-2 space-y-5">
                  {updates.map(u => (
                    <li key={u.id} className="ml-5">
                      <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-leaf border-2 border-background" />
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-medium">{formatDate(u.created_at)}</span>
                        <Badge variant="secondary" className="text-[10px] py-0 capitalize">{u.update_type}</Badge>
                      </div>
                      {u.note && <p className="text-sm mt-1.5 text-foreground">{u.note}</p>}
                      {u.photo_url && <img src={u.photo_url} alt="" className="mt-2 w-32 h-32 object-cover rounded border border-border/60" loading="lazy" />}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>

          {/* 4. PRODUCTION */}
          <Card className="p-6 md:p-8 border-border/60 shadow-soft">
            <h2 className="font-display text-2xl text-primary mb-5">Production record</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ["Flowering date", formatDate(tree.flowering_date)],
                ["Harvest date", formatDate(tree.harvest_date)],
                ["Yield expectation", tree.yield_expectation],
                ["Actual yield", tree.actual_yield ? `${tree.actual_yield} mangoes` : "Pending"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-border/40">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* 5. NOTES FEED */}
          <Card className="p-6 md:p-8 border-border/60 shadow-soft">
            <h2 className="font-display text-2xl text-primary mb-5">Living journal</h2>
            {updates.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">The chronicle of this tree begins here.</p>
            ) : (
              <div className="space-y-4">
                {updates.map(u => (
                  <div key={u.id} className="p-4 rounded-lg bg-leaf-soft/40 border border-leaf/15">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-primary">{formatDate(u.created_at)}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{u.update_type}</Badge>
                    </div>
                    {u.note && <p className="text-sm text-foreground">{u.note}</p>}
                    {u.photo_url && <img src={u.photo_url} alt="" className="mt-3 max-w-xs rounded border border-border/60" loading="lazy" />}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 6. QR CODE */}
          <Card className="p-6 md:p-8 border-border/60 shadow-soft">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2"><QrCode className="w-5 h-5 text-accent" /> Field QR card</h2>
            <p className="text-sm text-muted-foreground mb-6">Print, laminate, and place beside the tree. Scanning always opens the latest profile.</p>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Printable card */}
              <div
                ref={qrCardRef}
                className="bg-gradient-cream border-2 border-primary/15 rounded-xl p-5 shadow-soft"
                style={{ width: 240, height: 384 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-leaf flex items-center justify-center text-primary-foreground">
                    <MangoLeaf className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground">Rabeeyunil Awwal</div>
                    <div className="font-display text-[10px] text-primary">Mango Garden</div>
                  </div>
                </div>
                <div className="border-t border-b border-primary/15 py-2.5 my-2">
                  <div className="flex justify-between text-[10px]">
                    <div>
                      <div className="text-muted-foreground uppercase tracking-wider">Tree</div>
                      <div className="font-mono font-bold text-primary text-xs">{tree.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground uppercase tracking-wider">Line</div>
                      <div className="font-mono font-bold text-primary text-xs">{tree.line_position}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg flex items-center justify-center my-3">
                  <QRCodeSVG value={profileUrl} size={170} level="M" fgColor="#1a4731" />
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-muted-foreground italic">Scan to view full profile</p>
                  <p className="text-[8px] text-primary/60 mt-1">{GARDEN.variety} · Est. {GARDEN.established}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <Button onClick={downloadQR} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Download className="w-4 h-4 mr-1.5" /> Download QR card (PNG)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended print size: 5cm × 8cm. The QR resolves to <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{profileUrl}</code>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
