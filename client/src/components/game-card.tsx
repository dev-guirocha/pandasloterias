import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type Props = {
  title: string;
  description: string;
  Icon: IconType;
  accentClass?: string; // e.g. bg-emerald-500/10 text-emerald-500
  badge?: "JACKPOT" | "HOT" | "NOVO";
  onClick?: () => void;
};

export function GameCard({ title, description, Icon, accentClass = "", badge, onClick }: Props) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
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
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default GameCard;

