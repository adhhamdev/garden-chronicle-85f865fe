// Garden constants and helpers

export const GARDEN = {
  name: "Rabeeyunil Awwal Mango Garden",
  subtitle: "104 Tom JC Mango Trees · Hambantota, Sri Lanka",
  location: "No.38/4, 4 Mile Post, Govi Gammanaya, Keliyapura, Hambantota 82000",
  variety: "Tom JC",
  totalTrees: 104,
  irrigation: "Drip Irrigation System",
  spacing: "25-foot spacing between trees",
  established: "2025",
  firstHarvest: "2028–2029",
  yieldPerTree: "~300 mangoes (500g–600g each)",
};

export const LINES: { name: string; count: number; start: number }[] = [
  { name: "A1", count: 14, start: 1501 },
  { name: "A2", count: 13, start: 1515 },
  { name: "A3", count: 16, start: 1528 },
  { name: "A4", count: 16, start: 1544 },
  { name: "A5", count: 15, start: 1560 },
  { name: "A6", count: 15, start: 1575 },
  { name: "A7", count: 15, start: 1590 },
];

export type HealthStatus = "Good" | "Monitor" | "Attention";

export interface Tree {
  id: string;
  line: string;
  position: number;
  line_position: string;
  variety: string;
  planting_date: string;
  health_status: HealthStatus;
  height: string | null;
  canopy_diameter: string | null;
  last_fertilization: string | null;
  last_pruning: string | null;
  pest_observations: string | null;
  flowering_date: string | null;
  harvest_date: string | null;
  actual_yield: number | null;
  yield_expectation: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreeUpdate {
  id: string;
  tree_id: string;
  update_type: string;
  note: string | null;
  photo_url: string | null;
  photo_date: string | null;
  metadata: any;
  created_by: string | null;
  created_at: string;
}

export const healthColor = (s: HealthStatus) => {
  switch (s) {
    case "Good": return "bg-health-good";
    case "Monitor": return "bg-health-monitor";
    case "Attention": return "bg-health-attention";
  }
};

export const healthBadge = (s: HealthStatus) => {
  switch (s) {
    case "Good": return "bg-health-good/15 text-health-good border-health-good/30";
    case "Monitor": return "bg-health-monitor/15 text-health-monitor border-health-monitor/40";
    case "Attention": return "bg-health-attention/15 text-health-attention border-health-attention/40";
  }
};

export const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  } catch { return d; }
};
