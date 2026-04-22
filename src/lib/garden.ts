// Garden constants and helpers - full spec

export const GARDEN = {
  name: 'Rabeeyunil Awwal Mango Garden',
  shortName: 'Rabeeyunil Awwal',
  tagline:
    "Founded in the blessed month of the Prophet Muhammad's birth ﷺ - a garden of gratitude and growth.",
  location:
    'No.38/4, 4 Mile Post, Govi Gammanaya, Keliyapura, Hambantota 82000, Sri Lanka',
  city: 'Hambantota, Sri Lanka',
  variety: 'Tom JC',
  totalTrees: 104,
  area: '2 Acres',
  irrigation: 'Drip Irrigation System',
  spacing: '25 ft',
  established: '28 August 2025',
  establishedYear: '2025',
  firstHarvest: '2028 – 2029',
  yieldPerTree: '~300 mangos (500g–600g each)',
  bismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
};

export const LINES: { name: string; count: number; start: number }[] = [
  { name: 'A1', count: 14, start: 1501 },
  { name: 'A2', count: 13, start: 1515 },
  { name: 'A3', count: 16, start: 1528 },
  { name: 'A4', count: 16, start: 1544 },
  { name: 'A5', count: 15, start: 1560 },
  { name: 'A6', count: 15, start: 1575 },
  { name: 'A7', count: 15, start: 1590 },
];

// Ordered list of every tree id — used for prev/next navigation
export const ALL_TREE_IDS: string[] = LINES.flatMap((l) =>
  Array.from({ length: l.count }, (_, i) => `RAMG-${l.start + i}`),
);

export const getAdjacentTreeIds = (id: string) => {
  const i = ALL_TREE_IDS.indexOf(id);
  if (i === -1) return { prev: ALL_TREE_IDS[0], next: ALL_TREE_IDS[0] };
  const prev =
    ALL_TREE_IDS[(i - 1 + ALL_TREE_IDS.length) % ALL_TREE_IDS.length];
  const next = ALL_TREE_IDS[(i + 1) % ALL_TREE_IDS.length];
  return { prev, next };
};

export type HealthStatus = 'Good' | 'Monitor' | 'Attention';

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
    case 'Good':
      return 'bg-health-good';
    case 'Monitor':
      return 'bg-health-attention';
    case 'Attention':
      return 'bg-health-critical';
  }
};

export const healthDot = (s: HealthStatus) => {
  switch (s) {
    case 'Good':
      return 'hsl(var(--health-good))';
    case 'Monitor':
      return 'hsl(var(--health-attention))';
    case 'Attention':
      return 'hsl(var(--health-critical))';
  }
};

export const healthBadge = (s: HealthStatus) => {
  switch (s) {
    case 'Good':
      return 'bg-health-good/15 text-health-good border-health-good/30';
    case 'Monitor':
      return 'bg-health-attention/15 text-health-attention border-health-attention/40';
    case 'Attention':
      return 'bg-health-critical/15 text-health-critical border-health-critical/40';
  }
};

export const healthLabel = (s: HealthStatus) => {
  switch (s) {
    case 'Good':
      return '✅ Good';
    case 'Monitor':
      return '⚠️ Needs Attention';
    case 'Attention':
      return '🚨 Critical';
  }
};

export const formatDate = (d: string | null | undefined) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};

export const formatDateShort = (d: string | null | undefined) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};
