import gardenLogo from "@/assets/garden-logo.png";
import { GeometricDivider, Mango } from "@/components/Decorations";
import { FallingLeaves } from "@/components/FallingLeaves";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { GARDEN, LINES, type Tree, formatDateShort, healthBadge, healthDot } from "@/lib/garden";
import { ArrowRight, ChevronDown, Droplets, MapPin, QrCode, Ruler, Smartphone, Square, Trees as TreesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Stat = ({ Icon, value, label }: { Icon: React.ComponentType<{ className?: string }>; value: string; label: string }) => (
  <div className="flex flex-col items-center gap-2 px-6 min-w-[140px]">
    <Icon className="w-6 h-6 text-accent" />
    <div className="font-display text-3xl text-accent font-semibold">{value}</div>
    <div className="text-[11px] uppercase tracking-[0.18em] text-primary-foreground/75 font-sub text-center">{label}</div>
  </div>
);

export default function Index() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [featured, setFeatured] = useState<Tree | null>(null);

  useEffect(() => {
    document.title = "Rabeeyunil Awwal Mango Garden · 104 Tom JC Trees, Hambantota";
    const meta = document.querySelector('meta[name="description"]') ?? (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "A living digital record of 104 Tom JC mango trees in Hambantota, Sri Lanka. Founded in Rabeeyunil Awwal - the blessed month of the Prophet's ﷺ birth.");

    supabase.from("trees").select("*").order("id").then(({ data }) => {
      if (data) {
        setTrees(data as Tree[]);
        setFeatured((data as Tree[]).find(t => t.id === "RAMG-1501") ?? null);
      }
    });
  }, []);

  const treesByLine: Record<string, Tree[]> = {};
  trees.forEach(t => { (treesByLine[t.line] ||= []).push(t); });
  Object.values(treesByLine).forEach(arr => arr.sort((a, b) => a.position - b.position));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-hero">
        <FallingLeaves />
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 geo-pattern opacity-30 pointer-events-none" />
        {/* Geometric pattern handled above; tree silhouettes removed per design */}

        <div className="relative z-10 container text-center text-primary-foreground py-20">
          <div className="animate-fade-up">
            {/* Garden logo */}
            <img
              src={gardenLogo}
              alt="Rabeeyunil Awwal Mango Garden logo"
              width={1024}
              height={1024}
              className="mx-auto w-44 md:w-56 h-auto mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            />

            {/* Bismillah */}
            <p className="font-arabic text-3xl md:text-5xl text-accent gold-glow mb-2 leading-tight" dir="rtl">
              {GARDEN.bismillah}
            </p>

            {/* Salawat */}
            <p className="font-arabic text-xl md:text-2xl text-accent/80 mb-10 leading-tight" dir="rtl">
              اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ
            </p>

            {/* Garden name */}
            <h1 className="font-heading-arabic font-semibold text-balance leading-[1.05]" style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}>
              Rabeeyunil Awwal
              <span className="block text-accent mt-1">Mango Garden</span>
            </h1>

            <p className="mt-6 inline-flex items-center gap-2 text-sage font-sub text-sm md:text-base">
              <MapPin className="w-4 h-4" /> Hambantota, Sri Lanka
            </p>

            <p className="font-display italic text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto mt-6 text-balance">
              {GARDEN.tagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Button asChild size="lg" className="bg-gradient-gold text-primary hover:opacity-90 rounded-full px-8 font-sub font-medium shadow-gold-glow">
                <Link to="/garden">Explore the Garden <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 font-sub font-medium">
                <a href="#featured">View Featured Tree</a>
              </Button>
            </div>
          </div>
        </div>

        <a href="#stats" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/70 animate-bounce-slow z-10" aria-label="Scroll">
          <ChevronDown className="w-7 h-7" />
        </a>
      </section>

      {/* STATS BAR */}
      <section id="stats" className="bg-primary text-primary-foreground py-10">
        <div className="container overflow-x-auto">
          <div className="flex justify-center items-center gap-10 md:gap-16 min-w-[700px]">
            <Stat Icon={TreesIcon} value="104" label="Total Trees" />
            <Stat Icon={Mango} value="Tom JC" label="Mango Variety" />
            <Stat Icon={Square} value="2 Acres" label="Total Area" />
            <Stat Icon={Droplets} value="Drip" label="Irrigation" />
            <Stat Icon={Ruler} value="25 ft" label="Tree Spacing" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 leaf-pattern">
        <div className="container">
          <div className="flex items-center justify-center text-center">
            <div className="animate-fade-up">
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4 font-sub">The Garden</div>
              <h2 className="font-display text-4xl md:text-5xl text-primary leading-tight mb-6">
                A Garden Born from Blessing
              </h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>
                  This garden was founded and named after <strong className="text-primary">Rabeeyunil Awwal</strong> - the month in the Islamic calendar when our beloved Prophet Muhammad ﷺ was born. The naming is an act of love and devotion, a reminder that every fruit grown here is grown under blessed intention.
                </p>
                <p>
                  Established on <strong className="text-primary">28 August 2025</strong>, the garden spans 2 acres of land in Keliyapura, Hambantota, Sri Lanka. It houses <strong className="text-primary">104 Tom JC mango trees</strong>, each planted with care and tracked individually.
                </p>
                <p>
                  The garden is structured into <strong className="text-primary">7 lines (A1–A7)</strong> with 25-foot spacing around each tree, fed by a modern drip irrigation system to ensure consistent growth. Each tree carries a unique ID from <span className="font-mono text-primary">RAMG-1501</span> to <span className="font-mono text-primary">RAMG-1604</span>.
                </p>
                <p>
                  Every tree in this garden has its own digital record - a living document that grows with the tree, capturing its health (bi'iznillah), maintenance history, and eventual harvest. Scan any tree's QR code to access its complete profile instantly.
                </p>
                <div className="pt-6 border-t border-accent/20 mt-8">
                  <p className="font-arabic text-2xl text-accent mb-2" dir="rtl">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ</p>
                  <p className="text-sm italic text-muted-foreground font-sub text-balance">
                    "O Allah, send blessings upon Muhammad and the family of Muhammad"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container my-4"><GeometricDivider className="w-full max-w-2xl mx-auto text-sage" /></div>

      {/* GARDEN LAYOUT PREVIEW */}
      <section className="py-24 bg-gradient-cream border-y border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3 font-sub">Garden Layout</div>
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-3">7 lines, 104 trees, one vision</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sub">Tap any tree to open its full profile.</p>
          </div>

          <Card className="p-6 md:p-10 shadow-card border-border/60 overflow-x-auto">
            <div className="min-w-[700px] space-y-4">
              {LINES.map(line => {
                const lineTrees = treesByLine[line.name] ?? [];
                return (
                  <div key={line.name} className="flex items-center gap-4">
                    <div className="w-16 shrink-0">
                      <div className="font-display text-2xl text-primary">{line.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-sub">{line.count} trees</div>
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 flex-wrap py-3 px-4 rounded-xl bg-sage/15 border border-sage/30">
                      {lineTrees.map(t => (
                        <Link key={t.id} to={`/tree/${t.id}`} title={`${t.id} · ${t.line_position} · ${t.health_status}`} className="group relative">
                          <div
                            className="w-7 h-7 rounded-full hover:scale-125 transition-transform shadow-soft"
                            style={{ background: healthDot(t.health_status) }}
                          />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            {t.id} · {t.line_position}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-5 mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground font-sub">
              {[
                { c: "hsl(var(--health-good))", l: "Good" },
                { c: "hsl(var(--health-attention))", l: "Needs Attention" },
                { c: "hsl(var(--health-critical))", l: "Critical" },
              ].map(x => (
                <div key={x.l} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: x.c }} /> {x.l}
                </div>
              ))}
              <Link to="/garden" className="ml-auto text-primary font-medium hover:underline inline-flex items-center gap-1">
                View Full Map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW QR WORKS */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3 font-sub">The QR System</div>
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-3">A scan away from every tree's story</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { Icon: TreesIcon, title: "Find the Tree", desc: "Every tree in the garden has a laminated QR code label placed near its base." },
              { Icon: Smartphone, title: "Scan the Code", desc: "Scan with any phone camera - no app needed." },
              { Icon: QrCode, title: "View Full Record", desc: "See the tree's complete profile: health, photos, maintenance history, yield expectations." },
            ].map(({ Icon, title, desc }, i) => (
              <Card key={title} className="p-8 text-center border-border/60 shadow-soft hover-scale" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 rounded-full bg-gradient-gold mx-auto mb-5 flex items-center justify-center text-primary shadow-soft">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl text-primary mb-2">{title}</h3>
                <p className="text-muted-foreground font-sub text-sm leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TREE */}
      {featured && (
        <section id="featured" className="py-20 bg-gradient-cream border-y border-border/60">
          <div className="container max-w-4xl">
            <div className="text-center mb-10">
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3 font-sub">Featured Tree</div>
              <h2 className="font-display text-4xl md:text-5xl text-primary">The first chronicled tree</h2>
            </div>
            <Card className="p-8 md:p-10 border-2 border-accent/40 shadow-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-sub font-medium">
                Featured · Seed Tree
              </div>
              <div className="flex gap-6 items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge variant="outline" className="font-mono border-primary/20 text-primary">{featured.id}</Badge>
                    <Badge className="bg-accent/15 text-accent-foreground border border-accent/30 font-sub">Line {featured.line_position}</Badge>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-sub ${healthBadge(featured.health_status)}`}>● {featured.health_status}</span>
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl text-primary mb-4">Tom JC · A1 Position 01</h3>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-sub">
                    <dt className="text-muted-foreground">Planting date</dt><dd className="font-medium">{formatDateShort(featured.planting_date)}</dd>
                    <dt className="text-muted-foreground">Current height</dt><dd className="font-medium">{featured.height ?? "-"}</dd>
                    <dt className="text-muted-foreground">Yield expected</dt><dd className="font-medium">{featured.yield_expectation}</dd>
                    <dt className="text-muted-foreground">First harvest</dt><dd className="font-medium">{GARDEN.firstHarvest}</dd>
                  </dl>
                  <Button asChild className="mt-6 bg-primary hover:bg-primary/90 rounded-full font-sub">
                    <Link to={`/tree/${featured.id}`}>View this tree's full record <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
