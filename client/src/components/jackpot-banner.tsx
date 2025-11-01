import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Diamond } from "lucide-react";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function JackpotBanner() {
  const [amount, setAmount] = useState(() => 2_350_000 + Math.floor(Math.random() * 50_000));
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // cresce devagar (~R$ 1-3/seg)
      setAmount((v) => v + Math.floor((dt / 1000) * (1 + Math.random() * 2)));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="jackpot-banner">
      <div className="jackpot-banner__glow" />
      <div className="jackpot-banner__shine" />
      <div className="jackpot-sparks" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="jackpot-banner__content">
        <Diamond className="jackpot-icon" />
        <span className="jackpot-label">JACKPOT AO VIVO</span>
        <Sparkles className="jackpot-icon" />
        <span className="jackpot-amount">{formatBRL(amount)}</span>
      </div>
    </div>
  );
}
