import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Diamond } from "lucide-react";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

type Props = {
  backgroundSrc?: string;
  aspect?: string; // e.g. "1140 / 570"
  ariaLive?: "off" | "polite" | "assertive";
  className?: string;
};

export default function JackpotBanner({ backgroundSrc, aspect = "1140 / 570", ariaLive = "polite", className = "" }: Props) {
  const [amount, setAmount] = useState(() => 2_350_000 + Math.floor(Math.random() * 50_000));
  const intervalRef = useRef<number | null>(null);

  // Incrementa o valor a cada segundo com um passo visível
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const step = Math.floor(10 + Math.random() * 50); // +R$10–60/s
      setAmount((v) => v + step);
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className={`jackpot-banner ${backgroundSrc ? "has-image" : ""} ${className}`} style={{ ["--jackpot-aspect" as any]: aspect }}>
      {backgroundSrc && (
        <img className="jackpot-bg" src={backgroundSrc} alt="" aria-hidden />
      )}
      <div className="jackpot-banner__glow" />
      <div className="jackpot-banner__shine" />
      <div className="jackpot-sparks" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="jackpot-banner__content">
        <div className="jackpot-row">
          <Diamond className="jackpot-icon" />
          <span className="jackpot-title">Jackpot ao vivo</span>
          <Sparkles className="jackpot-icon" />
        </div>
        <span className="jackpot-amount" aria-live={ariaLive}>{formatBRL(amount)}</span>
      </div>
    </div>
  );
}
