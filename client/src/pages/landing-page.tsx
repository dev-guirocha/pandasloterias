import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Trophy, Zap, Shield, Gift, TrendingUp, Users, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch platform settings
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const platformName = (settings as any)?.platformName || "BetPlatform";

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
      icon: Trophy,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Casino Ao Vivo",
      description: "Dealers reais em tempo real",
      icon: Users,
      color: "bg-red-500/10 text-red-500",
    },
    {
      title: "Apostas Esportivas",
      description: "Futebol, basquete e mais",
      icon: TrendingUp,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Jogos Rápidos",
      description: "Crash, Mines, Plinko",
      icon: Zap,
      color: "bg-amber-500/10 text-amber-500",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Criptografia de ponta e dados protegidos",
    },
    {
      icon: Zap,
      title: "Saques Instantâneos",
      description: "Receba seus ganhos via PIX em minutos",
    },
    {
      icon: Gift,
      title: "Bônus Generosos",
      description: "Bônus de boas-vindas de R$ 50 + promoções",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{platformName}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild data-testid="link-login">
              <Link href="/auth">Entrar</Link>
            </Button>
            <Button asChild data-testid="link-register">
              <Link href="/auth">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container mx-auto relative px-4 max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" data-testid="badge-promo">
              <Gift className="mr-1 h-3 w-3" />
              Bônus de R$ 50 para novos jogadores
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              A Melhor Experiência de
              <span className="text-primary"> Casino & Apostas</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Milhares de jogos, odds competitivas e saques instantâneos via PIX.
              Comece agora e ganhe R$ 50 de bônus!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg" data-testid="button-cta-register">
                <Link href="/auth">
                  Começar Agora
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg" data-testid="button-cta-games">
                <a href="#games">Ver Jogos</a>
              </Button>
            </div>
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
              const GameIcon = game.icon;
              return (
                <Card key={game.title} className="hover-elevate cursor-pointer transition-all" data-testid={`card-game-${game.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${game.color}`}>
                      <GameIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {game.description}
                    </p>
                  </CardContent>
                </Card>
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
              const FeatureIcon = feature.icon;
              return (
                <div key={feature.title} className="text-center" data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <FeatureIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
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
            <p className="text-xl text-muted-foreground mb-8">
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
              <Trophy className="h-6 w-6 text-primary" />
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
