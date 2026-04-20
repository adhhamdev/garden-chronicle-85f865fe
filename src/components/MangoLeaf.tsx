interface Props {
  className?: string;
  filled?: boolean;
}

export const MangoLeaf = ({ className = "", filled = true }: Props) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.5}
  >
    <path d="M12 2C7 2 3 6 3 11c0 5 4 11 9 11s9-6 9-11c0-5-4-9-9-9zm0 2c4 0 7 3 7 7 0 1-.2 2-.5 3L8 7c1.2-1.8 2.5-3 4-3z" opacity={filled ? 0.95 : 1} />
    <path d="M12 4v16" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.4" />
  </svg>
);
