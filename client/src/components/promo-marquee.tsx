import React from "react";

type Props = {
  messages: string[];
  className?: string;
};

export default function PromoMarquee({ messages, className = "" }: Props) {
  const content = messages.join(" • ");
  return (
    <div className={`promo-marquee ${className}`}>
      <div className="promo-marquee__inner">
        <span>{content}</span>
        <span aria-hidden="true">{content}</span>
        <span aria-hidden="true">{content}</span>
      </div>
    </div>
  );
}

