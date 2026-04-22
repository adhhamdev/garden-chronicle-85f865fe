/** Small 2D mango (fruit + leaf) used for the falling animation */
const MangoFruit = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
    {/* Leaf */}
    <path
      d="M16 6 C12 4 8 5 7 8 C9 9 12 9 14 8 C15 7.4 15.6 6.7 16 6 Z"
      fill="hsl(152 47% 22%)"
    />
    <path d="M8 7.6 C10.5 8.4 13 8.4 15 7.4" stroke="hsl(152 47% 14%)" strokeWidth="0.5" fill="none" />
    {/* Stem */}
    <path d="M16 6 L16.4 9" stroke="hsl(152 47% 18%)" strokeWidth="1" strokeLinecap="round" />
    {/* Mango fruit body */}
    <ellipse cx="17" cy="19" rx="9" ry="10" fill="hsl(43 90% 58%)" />
    {/* Highlight */}
    <ellipse cx="14" cy="16" rx="2.4" ry="3.6" fill="hsl(47 95% 78%)" opacity="0.75" />
    {/* Subtle blush */}
    <ellipse cx="20" cy="22" rx="3" ry="4" fill="hsl(28 88% 55%)" opacity="0.35" />
  </svg>
);

/** Pure-CSS falling mangoes — rendered absolutely inside a relative parent */
export const FallingLeaves = () => {
  const mangoes = [
    { left: "5%", size: 22, dur: 16, delay: 0, rot: 20 },
    { left: "12%", size: 18, dur: 20, delay: 3, rot: 60 },
    { left: "20%", size: 26, dur: 18, delay: 6, rot: -20 },
    { left: "28%", size: 20, dur: 22, delay: 1, rot: 45 },
    { left: "38%", size: 28, dur: 19, delay: 8, rot: -10 },
    { left: "47%", size: 18, dur: 24, delay: 4, rot: 70 },
    { left: "55%", size: 24, dur: 17, delay: 9, rot: -40 },
    { left: "63%", size: 22, dur: 21, delay: 2, rot: 25 },
    { left: "72%", size: 20, dur: 23, delay: 5, rot: -55 },
    { left: "80%", size: 26, dur: 18, delay: 7, rot: 15 },
    { left: "88%", size: 18, dur: 20, delay: 10, rot: -30 },
    { left: "95%", size: 24, dur: 25, delay: 11, rot: 50 },
  ];
  return (
    <div className="leaves-container" aria-hidden="true">
      {mangoes.map((m, i) => (
        <div
          key={i}
          className="falling-leaf"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
          }}
        >
          <div style={{ transform: `rotate(${m.rot}deg)` }}>
            <MangoFruit className="w-full h-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
