import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GameCard from "@/components/game-card";
import { Badge } from "@/components/ui/badge";
import PromoMarquee from "@/components/promo-marquee";
import JackpotBanner from "@/components/jackpot-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Trophy, Gift as GiftLucide, ChevronRight, Sparkles, DollarSign } from "lucide-react";
import { Shield as ShieldPh, Lightning, Gift as GiftPh, DiamondsFour, DiceFive, SoccerBall, GameController } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AuroraBackground from "@/components/effects/aurora-background";
import { motion } from "framer-motion";
import PandaIcon from "@/components/icons/panda";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch platform settings
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const platformName = (settings as any)?.platformName || "Panda Loterias";

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const games = [
    {
      title: "Slots",
      description: "Milhares de jogos de slot",
      icon: DiamondsFour,
      color: "bg-chart-2/10 text-chart-2",
      badge: "JACKPOT",
    },
    {
      title: "Cassino Ao Vivo",
      description: "Dealers reais em tempo real",
      icon: DiceFive,
      color: "bg-chart-1/10 text-chart-1",
      badge: "HOT",
    },
    {
      title: "Apostas Esportivas",
      description: "Futebol, basquete e mais",
      icon: SoccerBall,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Jogos Rápidos",
      description: "Crash, Mines, Plinko",
      icon: GameController,
      color: "bg-chart-3/10 text-chart-3",
      badge: "NOVO",
    },
  ];

  const features = [
    {
      icon: ShieldPh,
      title: "100% Seguro",
      description: "Criptografia de ponta e dados protegidos",
    },
    {
      icon: Lightning,
      title: "Saques instantâneos",
      description: "Receba seus ganhos via PIX em minutos",
    },
    {
      icon: GiftPh,
      title: "bônus Generosos",
      description: "bônus de boas-vindas de R$ 50 + promoÃ§Ãµes",
    },
  ];

  return (
    <div className="min-h-screen relative bg-background">
      <AuroraBackground />
      {/* Header */}
      <header className="border-b/0 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <Link href="/" aria-label="Ir para a página inicial" className="group inline-flex items-center gap-3 rounded-xl px-2 py-1 -ml-2 hover:bg-muted/40 transition-colors">
            <div className="h-10 w-10 grid place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg casino-card-glow transition-transform group-hover:scale-105">
              <PandaIcon className="h-6 w-6" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-casino leading-none">{platformName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="text-muted-foreground" data-testid="link-login">
              <Link href="/auth">Entrar</Link>
            </Button>
            <Button asChild className="btn-glow" data-testid="link-register">
              <Link href="/auth">
                Cadastrar
                <Sparkles className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      {/* Promo bar */}
      <PromoMarquee
        messages={[
          "Bônus de R$ 50 para novos jogadores",
          "PIX instantâneo — saques em minutos",
          "Cassino Ao Vivo com dealers reais",
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-visible py-12 md:py-16">
        {/* Aurora background is globally positioned; section overlay not needed */}
        <div className="container mx-auto relative px-4 max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 hover-elevate" data-testid="badge-promo">
              <GiftLucide className="mr-1 h-3 w-3" />
              Bônus de R$ 50 para novos jogadores
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-2 leading-tight">
              A Melhor <span className="text-gradient-casino">Experiência</span> de
              <span className="text-gradient-casino"> Casino & Apostas</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Milhares de jogos, odds competitivas e saques instantâneos via PIX.
              Comece agora e ganhe R$ 50 de bônus!
            </p>
            <div className="flex justify-center">
              <Button size="lg" asChild className="text-lg btn-glow" data-testid="button-cta-register">
                <Link href="/auth">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Começar agora
                </Link>
              </Button>
            </div>
            <JackpotBanner className="jackpot--hero" backgroundSrc="/static/images/jackpot_zhuti_1140X570.svg" />
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Categorias de Jogos</h2>
            <p className="text-muted-foreground">
              Escolha entre milhares de opções de entretenimento
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {games.map((game) => {
              const GameIcon = game.icon as any;
              return (
                <GameCard
                  key={game.title}
                  title={game.title}
                  description={game.description}
                  Icon={GameIcon}
                  accentClass={game.color}
                  iconWeight={"fill"}
                  iconSize={28}
                  badge={game.badge as any}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por Que Escolher a {platformName}?</h2>
            <p className="text-muted-foreground">
              A plataforma mais confiável e segura do Brasil
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature) => {
              const FeatureIcon = feature.icon as any;
              return (
                <Card key={feature.title} className="card-glass hover-elevate">
                  <CardContent className="p-6 text-center">
                    <motion.div whileHover={{ scale: 1.05 }} className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                      <FeatureIcon size={28} weight="fill" className="text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Começar a Ganhar?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Cadastre-se agora e receba R$ 50 de bônus de boas-vindas
            </p>
            <Button size="lg" asChild className="text-lg" data-testid="button-footer-cta">
              <Link href="/auth">
                Criar Conta Grátis
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 grid place-items-center rounded-md bg-gradient-to-br from-primary to-primary/70 shadow-lg casino-card-glow">
                <PandaIcon className="h-5 w-5" />
              </div>
              <span className="font-bold">{platformName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 {platformName}. Jogue com responsabilidade. +18
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



















