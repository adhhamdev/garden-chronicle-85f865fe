import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GARDEN, LINES, type Tree, healthBadge, healthDot, formatDateShort } from "@/lib/garden";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GeometricDivider } from "@/components/Decorations";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ChevronRight, Search } from "lucide-react";

const PER_PAGE = 24;

export default function Garden() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sort, setSort] = useState("id");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Garden Map · All 104 Trees · Rabeeyunil Awwal Mango Garden";
    supabase.from("trees").select("*").order("id").then(({ data }) => {
      if (data) setTrees(data as Tree[]);
    });
  }, []);

  // Apply line filter from hash (e.g. #directory or set via clicking line card)
  useEffect(() => {
    if (window.location.hash === "#directory") {
      const el = document.getElementById("directory");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [trees]);

  const treesByLine: Record<string, Tree[]> = {};
  trees.forEach(t => { (treesByLine[t.line] ||= []).push(t); });
  Object.values(treesByLine).forEach(arr => arr.sort((a,b) => a.position - b.position));

  const filtered = useMemo(() => {
    let list = trees.filter(t => {
      const q = search.trim().toLowerCase();
      const matchQ = !q || t.id.toLowerCase().includes(q) || t.line.toLowerCase().includes(q) || t.line_position.toLowerCase().includes(q);
      const matchL = lineFilter === "all" || t.line === lineFilter;
      const matchH = healthFilter === "all" || t.health_status === healthFilter;
      return matchQ && matchL && matchH;
    });
    if (sort === "planting") list = [...list].sort((a,b) => a.planting_date.localeCompare(b.planting_date));
    if (sort === "health") list = [...list].sort((a,b) => a.health_status.localeCompare(b.health_status));
    return list;
  }, [trees, search, lineFilter, healthFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filterByLine = (line: string) => {
    setLineFilter(line);
    setPage(1);
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HEADER BANNER */}
      <section className="relative bg-gradient-leaf text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 geo-pattern opacity-30" />
        <div className="container relative">
          <nav className="text-xs font-sub text-primary-foreground/70 mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-accent">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-accent">Garden</span>
          </nav>
          <h1 className="font-display text-5xl md:text-7xl">The Garden</h1>
          <p className="font-sub text-primary-foreground/80 mt-3 max-w-xl">
            104 Tom JC mango trees, organised in seven lines, growing under the blessed care and legacy of Prophet Muhammad ﷺ.
          </p>
        </div>
      </section>

      {/* MAP */}
      <section className="py-16 bg-gradient-cream">
        <div className="container">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-2 font-sub">Interactive Map</div>
            <h2 className="font-display text-4xl text-primary">Walk the rows</h2>
          </div>
          <Card className="p-6 md:p-10 shadow-card border-border/60 overflow-x-auto">
            <div className="min-w-[700px] space-y-4">
              {LINES.map(line => {
                const lt = treesByLine[line.name] ?? [];
                return (
                  <div key={line.name} className="flex items-center gap-4">
                    <div className="w-16 shrink-0">
                      <div className="font-display text-2xl text-primary">{line.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-sub">{line.count} trees</div>
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 flex-wrap py-3 px-4 rounded-xl bg-sage/15 border border-sage/30">
                      {lt.map(t => (
                        <Link key={t.id} to={`/tree/${t.id}`} title={`${t.id} · ${t.line_position} · ${t.health_status}`} className="group relative">
                          <div className="w-8 h-8 rounded-full hover:scale-125 transition-transform shadow-soft"
                            style={{ background: healthDot(t.health_status) }} />
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {t.id} · {t.line_position}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          
          <div className="mt-16 text-center animate-fade-up">
            <p className="font-arabic text-2xl text-accent mb-2" dir="rtl">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ</p>
            <p className="text-xs italic text-muted-foreground font-sub max-w-md mx-auto">
              "O Allah, send blessings upon Muhammad and the family of Muhammad"
            </p>
          </div>
        </div>
      </section>

      <div className="container my-6"><GeometricDivider className="w-full max-w-2xl mx-auto text-sage" /></div>

      {/* LINE SUMMARY CARDS */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-2 font-sub">By Line</div>
            <h2 className="font-display text-4xl text-primary">Seven lines, each its own row</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LINES.map(line => {
              const lt = treesByLine[line.name] ?? [];
              const good = lt.filter(t => t.health_status === "Good").length;
              const monitor = lt.filter(t => t.health_status === "Monitor").length;
              const attention = lt.filter(t => t.health_status === "Attention").length;
              const idRange = `RAMG-${line.start} – RAMG-${line.start + line.count - 1}`;
              return (
                <Card key={line.name} className="p-6 border-border/60 shadow-soft hover-scale">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-display text-3xl text-primary">{line.name}</span>
                    <span className="text-xs text-muted-foreground font-sub">{line.count} trees</span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mb-4 break-all">{idRange}</p>
                  <div className="space-y-1.5 text-xs font-sub mb-5">
                    <div className="flex justify-between"><span className="text-health-good">● Good</span><span>{good}</span></div>
                    <div className="flex justify-between"><span className="text-health-attention">● Monitor</span><span>{monitor}</span></div>
                    <div className="flex justify-between"><span className="text-health-critical">● Attention</span><span>{attention}</span></div>
                  </div>
                  <Button onClick={() => filterByLine(line.name)} variant="outline" size="sm" className="w-full rounded-full font-sub">
                    View Line {line.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIRECTORY */}
      <section id="directory" className="py-16 bg-gradient-cream border-y border-border/60">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-2 font-sub">Directory</div>
              <h2 className="font-display text-4xl text-primary">All {GARDEN.totalTrees} trees</h2>
            </div>
            <div className="text-sm text-muted-foreground font-sub">Showing {filtered.length} {filtered.length === 1 ? "tree" : "trees"}</div>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mb-8">
            <div className="md:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search RAMG-1501 or A3…" className="pl-9 bg-card" />
            </div>
            <Select value={lineFilter} onValueChange={(v) => { setLineFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-card"><SelectValue placeholder="Line" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lines</SelectItem>
                {LINES.map(l => <SelectItem key={l.name} value={l.name}>Line {l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={(v) => { setHealthFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-card"><SelectValue placeholder="Health" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All health</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Monitor">Needs Attention</SelectItem>
                <SelectItem value="Attention">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="bg-card"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Sort by ID</SelectItem>
                <SelectItem value="planting">Planting date</SelectItem>
                <SelectItem value="health">Health status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paged.map(t => (
              <Card key={t.id} className="p-5 border-border/60 shadow-soft hover:shadow-card transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="font-mono text-[11px] border-accent/30 bg-accent/10 text-accent-foreground">{t.id}</Badge>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sub ${healthBadge(t.health_status)}`}>{t.health_status}</span>
                </div>
                <div className="font-display text-xl text-primary mb-1">Line {t.line_position}</div>
                <div className="text-xs text-muted-foreground font-sub mb-4 space-y-0.5">
                  <div>Planted {formatDateShort(t.planting_date)}</div>
                  {t.height && <div>Height: {t.height}</div>}
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full justify-between text-primary hover:bg-sage/15 font-sub">
                  <Link to={`/tree/${t.id}`}>View Tree <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></Link>
                </Button>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 font-sub text-sm">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="px-3 text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
