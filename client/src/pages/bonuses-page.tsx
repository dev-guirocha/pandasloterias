import { useState } from "react";
import { useBonuses, useApplyPromoCode } from "@/hooks/use-bonuses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Gift, TrendingUp, Percent, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Bonus } from "@shared/schema";

export default function BonusesPage() {
  const [promoCode, setPromoCode] = useState("");
  const { data: activeBonuses } = useBonuses("active");
  const { data: allBonuses } = useBonuses();
  const applyCode = useApplyPromoCode();
  const { toast } = useToast();

  const handleApplyCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Código inválido",
        description: "Digite um código promocional válido",
        variant: "destructive",
      });
      return;
    }

    try {
      await applyCode.mutateAsync(promoCode.toUpperCase());
      toast({
        title: "Bônus ativado!",
        description: "O bônus foi adicionado à sua conta",
      });
      setPromoCode("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível aplicar o código",
        variant: "destructive",
      });
    }
  };

  const getBonusIcon = (type: string) => {
    switch (type) {
      case "welcome": return <PartyPopper className="w-5 h-5" />;
      case "deposit_match": return <TrendingUp className="w-5 h-5" />;
      case "cashback": return <Percent className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getBonusTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: "Boas-vindas",
      deposit_match: "Match de Depósito",
      cashback: "Cashback",
      promotion: "Promoção",
      referral: "Indicação",
    };
    return labels[type] || type;
  };

  const getWagerProgress = (bonus: Bonus) => {
    const current = parseFloat(bonus.currentWager || "0");
    const required = parseFloat(bonus.wagerRequirement || "0");
    if (required === 0) return 100;
    return Math.min((current / required) * 100, 100);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Bônus & Promoções</h1>
        <p className="text-muted-foreground">
          Aproveite bônus exclusivos e promoções especiais
        </p>
      </div>

      {/* Apply Promo Code */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Aplicar Código Promocional
          </CardTitle>
          <CardDescription>
            Possui um código de promoção? Insira aqui para ativar o bônus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1"
              data-testid="input-promo-code"
            />
            <Button
              onClick={handleApplyCode}
              disabled={applyCode.isPending || !promoCode.trim()}
              data-testid="button-apply-code"
            >
              {applyCode.isPending ? "Aplicando..." : "Aplicar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Bonuses */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Bônus Ativos</h2>
        {!activeBonuses || activeBonuses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Você não possui bônus ativos no momento
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeBonuses.map((bonus) => {
              const wagerProgress = getWagerProgress(bonus);
              const wagerRequired = parseFloat(bonus.wagerRequirement || "0");
              const wagerCurrent = parseFloat(bonus.currentWager || "0");

              return (
                <Card key={bonus.id} data-testid={`card-bonus-${bonus.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {getBonusIcon(bonus.type)}
                        <div>
                          <CardTitle className="text-base">
                            {getBonusTypeLabel(bonus.type)}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {bonus.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-primary">
                        R$ {parseFloat(bonus.amount).toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {wagerRequired > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso de Apostas</span>
                          <span className="font-medium">
                            R$ {wagerCurrent.toFixed(2)} / R$ {wagerRequired.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={wagerProgress} className="h-2" />
                      </div>
                    )}
                    {bonus.code && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">Código:</span>
                        <span className="ml-2 font-mono font-semibold">{bonus.code}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* All Bonuses History */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Histórico de Bônus</h2>
        {!allBonuses || allBonuses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum bônus encontrado
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allBonuses.map((bonus) => (
              <Card key={bonus.id} className="hover-elevate" data-testid={`card-bonus-history-${bonus.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getBonusIcon(bonus.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{getBonusTypeLabel(bonus.type)}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {bonus.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        R$ {parseFloat(bonus.amount).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {bonus.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
