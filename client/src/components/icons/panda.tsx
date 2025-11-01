import React from "react";

type Props = { className?: string };

export function PandaIcon({ className = "h-8 w-8" }: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="36" r="20" fill="hsl(var(--brand-ivory))"/>
      <circle cx="18" cy="26" r="8" fill="hsl(var(--brand-ink))"/>
      <circle cx="46" cy="26" r="8" fill="hsl(var(--brand-ink))"/>
      <circle cx="26" cy="34" r="6" fill="#fff"/>
      <circle cx="38" cy="34" r="6" fill="#fff"/>
      <circle cx="28" cy="34" r="2.5" fill="hsl(var(--brand-ink))"/>
      <circle cx="36" cy="34" r="2.5" fill="hsl(var(--brand-ink))"/>
      <ellipse cx="32" cy="42" rx="6" ry="3.5" fill="hsl(var(--brand-bamboo))"/>
    </svg>
  );
}

export default PandaIcon;

