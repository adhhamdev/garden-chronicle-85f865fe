/* Decorative SVGs: mango leaf, Islamic 8-point star, geometric divider */

interface SvgProps { className?: string; style?: React.CSSProperties }

export const MangoLeaf = ({ className = "", style }: SvgProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
    <path d="M12 2C7 2 3 6 3 11c0 5 4 11 9 11s9-6 9-11c0-5-4-9-9-9zm0 2c4 0 7 3 7 7 0 1-.2 2-.5 3L8 7c1.2-1.8 2.5-3 4-3z" />
    <path d="M12 4v16" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4" />
  </svg>
);

export const IslamicStar = ({ className = "" }: SvgProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
    <polygon points="50,5 61,28 86,28 67,45 75,70 50,55 25,70 33,45 14,28 39,28" opacity="0.8"/>
    <polygon points="50,15 58,32 76,32 62,44 68,62 50,52 32,62 38,44 24,32 42,32" opacity="0.5"/>
    <circle cx="50" cy="50" r="3" fill="currentColor"/>
  </svg>
);

export const GeometricDivider = ({ className = "" }: SvgProps) => (
  <svg viewBox="0 0 600 30" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
    <line x1="0" y1="15" x2="240" y2="15" opacity="0.4"/>
    <line x1="360" y1="15" x2="600" y2="15" opacity="0.4"/>
    <g transform="translate(300,15)">
      <polygon points="0,-12 4,-4 12,-4 6,2 9,10 0,5 -9,10 -6,2 -12,-4 -4,-4" fill="currentColor" opacity="0.7"/>
      <circle cx="-30" cy="0" r="2" fill="currentColor" opacity="0.6"/>
      <circle cx="30" cy="0" r="2" fill="currentColor" opacity="0.6"/>
    </g>
  </svg>
);

/** Stylized mango tree silhouette for hero */
export const MangoTreeSilhouette = ({ className = "", style }: SvgProps) => (
  <svg viewBox="0 0 200 200" className={className} style={style} fill="currentColor" aria-hidden>
    <ellipse cx="100" cy="80" rx="70" ry="60" opacity="0.9"/>
    <ellipse cx="60" cy="90" rx="40" ry="40" opacity="0.85"/>
    <ellipse cx="140" cy="90" rx="40" ry="40" opacity="0.85"/>
    <ellipse cx="100" cy="60" rx="50" ry="40" opacity="0.95"/>
    <rect x="92" y="130" width="16" height="60" rx="3"/>
    <circle cx="80" cy="70" r="4" fill="hsl(43 82% 55%)" opacity="0.8"/>
    <circle cx="120" cy="85" r="4" fill="hsl(43 82% 55%)" opacity="0.8"/>
    <circle cx="100" cy="100" r="3" fill="hsl(43 82% 55%)" opacity="0.7"/>
  </svg>
);

/** 12-point star for footer/decorative */
export const TwelvePointStar = ({ className = "" }: SvgProps) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
    <g>
      {Array.from({length: 12}).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 50 + Math.cos(a) * 45;
        const y1 = 50 + Math.sin(a) * 45;
        const a2 = ((i * 30 + 15) * Math.PI) / 180;
        const x2 = 50 + Math.cos(a2) * 22;
        const y2 = 50 + Math.sin(a2) * 22;
        return <polygon key={i} points={`50,50 ${x1},${y1} ${x2},${y2}`} opacity={i % 2 === 0 ? 0.85 : 0.55}/>
      })}
    </g>
    <circle cx="50" cy="50" r="6" fill="hsl(var(--background))"/>
  </svg>
);
