import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  type Tree,
  type TreeUpdate,
  type HealthStatus,
  healthBadge,
  healthLabel,
  formatDate,
  GARDEN,
  getAdjacentTreeIds,
} from "@/lib/garden";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MangoLeaf, GeometricDivider } from "@/components/Decorations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ClipboardEdit,
  Download,
  Image as ImageIcon,
  Leaf,
  Loader2,
  QrCode,
  Ruler,
  Sprout,
} from "lucide-react";

export default function TreeProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, user } = useAuth();
  const [tree, setTree] = useState<Tree | null>(null);
  const [updates, setUpdates] = useState<TreeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const qrCardRef = useRef<HTMLDivElement>(null);

  // Add update form
  const [editOpen, setEditOpen] = useState(false);
  const [updateType, setUpdateType] = useState("note");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Specs form
  const [specsOpen, setSpecsOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [canopy, setCanopy] = useState("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("Good");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [treeRes, updRes] = await Promise.all([
      supabase.from("trees").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("tree_updates")
        .select("*")
        .eq("tree_id", id)
        .order("created_at", { ascending: false }),
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

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (tree) {
      document.title = `${tree.id} · ${tree.line_position} · Rabeeyunil Awwal Mango Garden`;
      const meta =
        document.querySelector('meta[name="description"]') ??
        (() => {
          const m = document.createElement("meta");
          m.setAttribute("name", "description");
          document.head.appendChild(m);
          return m;
        })();
      meta.setAttribute(
        "content",
        `Tree ${tree.id} (${tree.line_position}) — Tom JC mango tree profile, photos, health logs and harvest record at Rabeeyunil Awwal Mango Garden.`
      );
    }
  }, [tree]);

  const photos = updates
    .filter((u) => u.photo_url)
    .sort((a, b) =>
      (b.photo_date ?? b.created_at).localeCompare(a.photo_date ?? a.created_at)
    );

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
        const { error: upErr } = await supabase.storage
          .from("tree-photos")
          .upload(path, photoFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("tree-photos")
          .getPublicUrl(path);
        photo_url = pub.publicUrl;
        photo_date = new Date().toISOString().slice(0, 10);
      }
      const { error } = await supabase.from("tree_updates").insert({
        tree_id: tree.id,
        update_type: photo_url ? "photo" : updateType,
        note: note || null,
        photo_url,
        photo_date,
        created_by: user.id,
      });
      if (error) throw error;

      const today = new Date().toISOString().slice(0, 10);
      const patch: any = {};
      if (updateType === "fertilization") patch.last_fertilization = today;
      if (updateType === "pruning") patch.last_pruning = today;
      if (Object.keys(patch).length)
        await supabase.from("trees").update(patch).eq("id", tree.id);

      toast.success("Update saved");
      setNote("");
      setPhotoFile(null);
      setUpdateType("note");
      setEditOpen(false);
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
      const { error } = await supabase
        .from("trees")
        .update({
          height: height || null,
          canopy_diameter: canopy || null,
          health_status: healthStatus,
        })
        .eq("id", tree.id);
      if (error) throw error;
      await supabase.from("tree_updates").insert({
        tree_id: tree.id,
        update_type: "measurement",
        note: `Specs updated · Height: ${height || "—"} · Canopy: ${
          canopy || "—"
        } · Health: ${healthStatus}`,
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
    const canvas = await html2canvas(qrCardRef.current, {
      scale: 3,
      backgroundColor: "#FAF7F0",
    });
    const link = document.createElement("a");
    link.download = `${tree?.id}-qr-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!tree) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Tree not found.</p>
        <Button onClick={() => nav("/garden")}>Back to garden</Button>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/tree/${tree.id}`;
  const { prev, next } = getAdjacentTreeIds(tree.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container max-w-4xl py-8 md:py-12 flex-1">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/garden">Garden</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono">{tree.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/garden">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Garden Map
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge
                variant="outline"
                className="border-accent/40 bg-accent/10 text-accent font-mono"
              >
                {tree.line_position}
              </Badge>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border ${healthBadge(
                  tree.health_status
                )}`}
              >
                {healthLabel(tree.health_status)}
              </span>
            </div>
            <h1 className="font-display font-semibold text-5xl md:text-6xl text-primary leading-none font-mono-id tracking-tight">
              <span className="font-mono">{tree.id}</span>
            </h1>
            <p className="text-muted-foreground mt-3 font-sub">
              {GARDEN.name} · Tom JC · Planted {formatDate(tree.planting_date)}
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 rounded-full">
                    <ClipboardEdit className="w-4 h-4 mr-1.5" /> Add update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                      Add update for {tree.id}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={submitUpdate} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Update type</Label>
                      <Select value={updateType} onValueChange={setUpdateType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setPhotoFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Note</Label>
                      <Textarea
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Describe what you observed or did…"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {busy ? "Saving…" : "Save update"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <Ruler className="w-4 h-4 mr-1.5" /> Edit specs
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                      Edit specifications
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={saveSpecs} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Height</Label>
                      <Input
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder='e.g. 1&#39;9" (54cm)'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Canopy diameter</Label>
                      <Input
                        value={canopy}
                        onChange={(e) => setCanopy(e.target.value)}
                        placeholder="e.g. 80cm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Health status</Label>
                      <Select
                        value={healthStatus}
                        onValueChange={(v) => setHealthStatus(v as HealthStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Monitor">Monitor</SelectItem>
                          <SelectItem value="Attention">Attention</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {busy ? "Saving…" : "Save"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* SPECS */}
          <Card className="p-6 md:p-8 border-border shadow-soft rounded-2xl">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-accent" /> Tree specifications
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {(
                [
                  ["Tree ID", <span className="font-mono">{tree.id}</span>],
                  ["Line", tree.line],
                  ["Position", <span className="font-mono">{tree.line_position}</span>],
                  ["Variety", tree.variety],
                  ["Planting date", formatDate(tree.planting_date)],
                  ["Current height", tree.height ?? "—"],
                  ["Canopy diameter", tree.canopy_diameter ?? "—"],
                  ["Irrigation", GARDEN.irrigation],
                  ["Spacing", GARDEN.spacing],
                ] as [string, React.ReactNode][]
              ).map(([k, v], i) => (
                <div
                  key={i}
                  className="flex justify-between py-2.5 border-b border-border/50"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* VISUAL */}
          <Card className="p-6 md:p-8 border-border shadow-soft rounded-2xl">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2">
              <Camera className="w-5 h-5 text-accent" /> Visual documentation
            </h2>
            {photos.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-2xl py-14 text-center text-muted-foreground bg-muted/30">
                <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  No photos yet — this tree's story is just beginning 🌱
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl overflow-hidden border border-border bg-muted"
                  >
                    <img
                      src={p.photo_url!}
                      alt={`${tree.id} on ${formatDate(p.photo_date)}`}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <div className="p-2.5 text-xs text-muted-foreground bg-card">
                      {formatDate(p.photo_date ?? p.created_at)}
                      {p.note && (
                        <span className="block mt-1 italic text-foreground/80">
                          {p.note}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* HEALTH & MAINTENANCE LOG */}
          <Card className="p-6 md:p-8 border-border shadow-soft rounded-2xl">
            <h2 className="font-display text-2xl text-primary mb-5 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-accent" /> Health &amp; maintenance log
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm mb-6">
              {(
                [
                  ["Health status", healthLabel(tree.health_status)],
                  ["Last fertilization", formatDate(tree.last_fertilization)],
                  ["Last pruning", formatDate(tree.last_pruning)],
                  ["Pest / disease", tree.pest_observations ?? "None recorded"],
                ] as [string, React.ReactNode][]
              ).map(([k, v], i) => (
                <div
                  key={i}
                  className="flex justify-between py-2.5 border-b border-border/50"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>

            {updates.length > 0 ? (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-sub">
                  Activity timeline
                </h3>
                <ol className="relative border-l-2 border-sage/40 ml-2 space-y-5">
                  {updates.map((u) => (
                    <li key={u.id} className="ml-5">
                      <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-sage border-2 border-background" />
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {formatDate(u.created_at)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 capitalize"
                        >
                          {u.update_type}
                        </Badge>
                      </div>
                      {u.note && (
                        <p className="text-sm mt-1.5 text-foreground">{u.note}</p>
                      )}
                      {u.photo_url && (
                        <img
                          src={u.photo_url}
                          alt=""
                          className="mt-2 w-32 h-32 object-cover rounded-lg border border-border"
                          loading="lazy"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No maintenance logs recorded yet.
              </p>
            )}
          </Card>

          {/* PRODUCTION */}
          <Card className="p-6 md:p-8 border-border shadow-soft rounded-2xl">
            <h2 className="font-display text-2xl text-primary mb-5">
              Production record
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {(
                [
                  ["Variety", tree.variety],
                  ["Expected flowering", GARDEN.firstHarvest],
                  ["Expected harvest", GARDEN.firstHarvest],
                  ["Yield expectation", tree.yield_expectation],
                  ["Expected fruit weight", "500g – 600g per fruit"],
                  [
                    "Actual yield (Season 1)",
                    tree.actual_yield ? `${tree.actual_yield} mangoes` : "— (not yet)",
                  ],
                ] as [string, React.ReactNode][]
              ).map(([k, v], i) => (
                <div
                  key={i}
                  className="flex justify-between py-2.5 border-b border-border/50"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* JOURNAL */}
          <Card className="p-6 md:p-8 border-border shadow-soft rounded-2xl">
            <h2 className="font-display text-2xl text-primary mb-5">
              Notes &amp; history
            </h2>
            {updates.filter((u) => u.note).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No notes recorded for this tree yet.
              </p>
            ) : (
              <div className="space-y-3">
                {updates
                  .filter((u) => u.note)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl bg-sage/10 border border-sage/20"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-primary">
                          {formatDate(u.created_at)}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize"
                        >
                          {u.update_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{u.note}</p>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* QR CARD */}
          <Card className="p-6 md:p-8 border-border shadow-soft rounded-2xl">
            <h2 className="font-display text-2xl text-primary mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-accent" /> Tree QR code
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Print, laminate, and place beside the tree. Scanning always opens
              the latest live profile.
            </p>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Printable card — 800x400 (2:1) at display scale */}
              <div
                ref={qrCardRef}
                className="bg-background border-2 border-primary/20 rounded-2xl shadow-card overflow-hidden flex"
                style={{ width: 480, height: 240 }}
              >
                {/* Left: QR */}
                <div className="w-1/2 bg-background flex items-center justify-center p-4 border-r border-accent/30">
                  <QRCodeSVG
                    value={profileUrl}
                    size={200}
                    level="M"
                    fgColor="#1B4332"
                    bgColor="#FAF7F0"
                  />
                </div>
                {/* Right: details */}
                <div className="w-1/2 p-5 flex flex-col justify-between bg-gradient-cream">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <MangoLeaf className="w-4 h-4" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-sub">
                        Rabeeyunil Awwal
                      </div>
                      <div className="font-display text-[11px] text-primary font-semibold">
                        Mango Garden
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-primary text-2xl leading-none">
                      {tree.id}
                    </div>
                    <div className="font-mono text-accent text-sm mt-1">
                      {tree.line_position}
                    </div>
                  </div>
                  <div className="border-t border-accent/30 pt-2">
                    <div className="text-[9px] text-muted-foreground italic">
                      Scan to view full profile
                    </div>
                    <div className="text-[8px] text-primary/70 mt-0.5">
                      Hambantota, Sri Lanka · Est. {GARDEN.established}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <Button
                  onClick={downloadQR}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download QR card (PNG)
                </Button>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Recommended print size: <strong>5cm × 8cm</strong>, laminated.
                  The QR resolves to:
                </p>
                <code className="block text-[11px] bg-muted px-2 py-1.5 rounded break-all">
                  {profileUrl}
                </code>
              </div>
            </div>
          </Card>
        </div>

        {/* Geometric divider */}
        <div className="my-12 text-accent">
          <GeometricDivider className="w-full max-w-md mx-auto" />
        </div>

        {/* Prev / Next nav */}
        <nav className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
          <Button
            asChild
            variant="outline"
            className="rounded-full justify-start h-auto py-3"
          >
            <Link to={`/tree/${prev}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-left">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Previous
                </span>
                <span className="font-mono text-sm">{prev}</span>
              </span>
            </Link>
          </Button>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            <Link to="/garden">Back to all trees</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full justify-end h-auto py-3"
          >
            <Link to={`/tree/${next}`}>
              <span className="text-right">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Next
                </span>
                <span className="font-mono text-sm">{next}</span>
              </span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
