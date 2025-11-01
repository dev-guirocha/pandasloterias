import React from "react";

export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`aurora pointer-events-none ${className}`} aria-hidden>
      <span className="aurora-item aurora-1" />
      <span className="aurora-item aurora-2" />
      <span className="aurora-item aurora-3" />
      <span className="aurora-item aurora-4" />
    </div>
  );
}

export default AuroraBackground;

