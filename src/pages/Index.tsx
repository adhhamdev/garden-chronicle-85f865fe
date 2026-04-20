import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GARDEN, LINES, type Tree, healthBadge, healthColor, formatDate } from "@/lib/garden";
import { SiteHeader } from "@/components/SiteHeader";
import { MangoLeaf } from "@/components/MangoLeaf";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, MapPin, Droplets, Calendar, Search, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-orchard.jpg";

const Counter = ({ to, suffix = "", label }: { to: number | string; suffix?: string; label: string }) => (
  <div className="text-center animate-count">
    <div className="font-display text-4xl md:text-5xl font-semibold text-accent">
      {to}{suffix}
    </div>
    <div className="text-xs uppercase tracking-[0.2em] mt-2 text-primary-foreground/80">{label}</div>
  </div>
);

export default function Index() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Rabeeyunil Awwal Mango Garden · 104 Tom JC Trees, Hambantota";
    const meta = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement("meta"); m.setAttribute("name","description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "A living digital record of 104 Tom JC mango trees grown in Hambantota, Sri Lanka. Tree-by-tree documentation, health logs and harvest history.");

    supabase.from("trees").select("*").order("id").then(({ data }) => {
      if (data) setTrees(data as Tree[]);
    });
  }, []);

  const filtered = useMemo(() => {
    return trees.filter(t => {
      const q = search.trim().toLowerCase();
      const matchQ = !q || t.id.toLowerCase().includes(q) || t.line.toLowerCase().includes(q) || t.line_position.toLowerCase().includes(q);
      const matchL = lineFilter === "all" || t.line === lineFilter;
      const matchH = healthFilter === "all" || t.health_status === healthFilter;
      return matchQ && matchL && matchH;
    });
  }, [trees, search, lineFilter, healthFilter]);

  const treesByLine = useMemo(() => {
    const m: Record<string, Tree[]> = {};
    trees.forEach(t => { (m[t.line] ||= []).push(t); });
    Object.values(m).forEach(arr => arr.sort((a,b) => a.position - b.position));
    return m;
  }, [trees]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        <img src={heroImg} alt="Lush mango orchard at golden hour with rows of Tom JC mango trees" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative h-full container flex flex-col justify-end pb-16 md:pb-24 text-primary-foreground">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent backdrop-blur-sm mb-5 text-xs uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5" /> Est. {GARDEN.established}
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] font-semibold text-balance">
              {GARDEN.name}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-primary-foreground/85 max-w-2xl">
              {GARDEN.subtitle}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-3xl border-t border-primary-foreground/15 pt-8">
            <Counter to={104} label="Trees" />
            <Counter to={7} label="Lines" />
            <Counter to={GARDEN.established} label="Established" />
            <Counter to="Drip" label="Irrigated" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 md:py-28 leaf-pattern">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">The Garden</div>
              <h2 className="font-display text-4xl md:text-5xl text-primary leading-tight mb-6">
                A living record, rooted in care.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Each of the 104 Tom JC mango trees in our Hambantota garden has its own page —
                its own story. Photos, measurements, health checks and notes accumulate over
                years, building a permanent digital chronicle of the orchard.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A QR code beside every tree links to its live profile. The garden grows; the
                record grows with it.
              </p>
            </div>
            <Card className="p-8 shadow-card border-border/60 bg-card/80 backdrop-blur">
              <h3 className="font-display text-xl text-primary mb-5">Garden details</h3>
              <dl className="space-y-3.5 text-sm">
                {[
                  ["Location", GARDEN.location, MapPin],
                  ["Variety", GARDEN.variety, MangoLeaf],
                  ["Total trees", "104", null],
                  ["Irrigation", GARDEN.irrigation, Droplets],
                  ["Layout", "7 lines (A1–A7), 25-foot spacing", null],
                  ["Tree IDs", "RAMG-1501 to RAMG-1604", null],
                  ["Expected first harvest", GARDEN.firstHarvest, Calendar],
                  ["Yield per tree", GARDEN.yieldPerTree, null],
                ].map(([k, v, Icon]: any) => (
                  <div key={k} className="flex gap-4 py-2.5 border-b border-border/50 last:border-0">
                    <dt className="text-muted-foreground w-36 shrink-0 flex items-center gap-1.5">
                      {Icon && <Icon className="w-3.5 h-3.5" />} {k}
                    </dt>
                    <dd className="text-foreground font-medium flex-1">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </section>

      {/* GARDEN MAP */}
      <section className="py-20 md:py-28 bg-gradient-cream border-y border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Garden Map</div>
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-3">Seven lines, one hundred & four trees</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Tap any tree to open its full profile.</p>
          </div>

          <Card className="p-6 md:p-10 shadow-card border-border/60 overflow-x-auto">
            <div className="min-w-[700px] space-y-5">
              {LINES.map(line => {
                const lineTrees = treesByLine[line.name] ?? [];
                return (
                  <div key={line.name} className="flex items-center gap-4">
                    <div className="w-16 shrink-0">
                      <div className="font-display text-2xl text-primary">{line.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{line.count} trees</div>
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 flex-wrap py-3 px-4 rounded-lg bg-leaf-soft/40 border border-leaf/15">
                      {lineTrees.map(t => (
                        <Link
                          key={t.id}
                          to={`/tree/${t.id}`}
                          title={`${t.id} · ${t.line_position} · ${t.health_status}`}
                          className="group relative"
                        >
                          <div className={`w-7 h-7 rounded-full ${healthColor(t.health_status)} flex items-center justify-center text-primary-foreground hover:scale-125 transition-transform shadow-soft`}>
                            <MangoLeaf className="w-3.5 h-3.5" />
                          </div>
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {t.id}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-5 mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
              {(["Good","Monitor","Attention"] as const).map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${healthColor(s)}`} />
                  {s}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Tree Directory</div>
              <h2 className="font-display text-4xl md:text-5xl text-primary">All 104 trees</h2>
            </div>
            <div className="text-sm text-muted-foreground">{filtered.length} of {trees.length} shown</div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-8">
            <div className="md:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search RAMG-1501 or A3…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={lineFilter} onValueChange={setLineFilter}>
              <SelectTrigger><SelectValue placeholder="Line" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lines</SelectItem>
                {LINES.map(l => <SelectItem key={l.name} value={l.name}>Line {l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger><SelectValue placeholder="Health" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All health</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Monitor">Monitor</SelectItem>
                <SelectItem value="Attention">Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(t => (
              <Card key={t.id} className="p-5 shadow-soft hover:shadow-card transition-shadow border-border/60 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2 border-primary/20 text-primary font-mono text-[11px]">
                      {t.id}
                    </Badge>
                    <div className="font-display text-lg text-primary">Line {t.line_position}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${healthBadge(t.health_status)}`}>
                    {t.health_status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Planted {formatDate(t.planting_date)}
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full justify-between text-primary hover:bg-leaf-soft">
                  <Link to={`/tree/${t.id}`}>
                    View tree profile <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-primary-foreground py-14">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <MangoLeaf className="w-6 h-6 text-accent" />
                <span className="font-display text-2xl">{GARDEN.name}</span>
              </div>
              <p className="text-primary-foreground/70 text-sm max-w-md">{GARDEN.location}</p>
              <p className="text-primary-foreground/60 text-xs mt-2">Established {GARDEN.established}</p>
            </div>
            <p className="text-primary-foreground/70 text-sm italic font-display">
              A living digital record — updated as the garden grows.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
