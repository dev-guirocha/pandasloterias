import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type IconType = React.ComponentType<any>;

type Props = {
  title: string;
  description: string;
  Icon: IconType;
  accentClass?: string; // e.g. bg-emerald-500/10 text-emerald-500
  badge?: "JACKPOT" | "HOT" | "NOVO";
  iconSize?: number;
  iconWeight?: any; // phosphor weight e.g. "fill" | "duotone"
  onClick?: () => void;
};

export function GameCard({ title, description, Icon, accentClass = "", badge, iconSize = 28, iconWeight = "fill", onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card onClick={onClick} className="hover-elevate casino-card-glow cursor-pointer transition-all border relative overflow-hidden">
        <CardContent className="p-6">
          {badge && (
            <div className="absolute top-3 right-3">
              <Badge className={badge === "JACKPOT" ? "badge-jackpot" : badge === "HOT" ? "badge-hot" : "badge-new"}>
                {badge}
              </Badge>
            </div>
          )}
          <div className={`inline-flex p-3 rounded-lg mb-4 ${accentClass}`}>
            <Icon size={iconSize} weight={iconWeight} />
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default GameCard;
