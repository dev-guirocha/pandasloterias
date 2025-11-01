// Shadcn Sidebar component for navigation
import { 
  Home, 
  Wallet, 
  History, 
  Trophy, 
  Shield, 
  Settings,
  Users,
  FileCheck,
  BarChart3,
  LogOut,
  AlertTriangle,
  Gift,
  TrendingUp,
  Bell
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PandaIcon from "@/components/icons/panda";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const userMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      testId: "nav-dashboard",
    },
    {
      title: "Carteira",
      url: "/wallet",
      icon: Wallet,
      testId: "nav-wallet",
    },
    {
      title: "Apostas",
      url: "/bets",
      icon: Dice6,
      testId: "nav-bets",
    },
    {
      title: "Bônus",
      url: "/bonuses",
      icon: Gift,
      testId: "nav-bonuses",
    },
    {
      title: "Histórico",
      url: "/transactions",
      icon: History,
      testId: "nav-transactions",
    },
    {
      title: "Verificação KYC",
      url: "/kyc",
      icon: Shield,
      testId: "nav-kyc",
    },
    {
      title: "Notificações",
      url: "/notifications",
      icon: Bell,
      testId: "nav-notifications",
    },
  ];

  const adminMenuItems = [
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: TrendingUp,
      testId: "nav-admin-analytics",
    },
    {
      title: "UsuÃ¡rios",
      url: "/admin/users",
      icon: Users,
      testId: "nav-admin-users",
    },
    {
      title: "AprovaÃ§Ãµes KYC",
      url: "/admin/kyc",
      icon: FileCheck,
      testId: "nav-admin-kyc",
    },
    {
      title: "Alertas de Fraude",
      url: "/admin/fraud-alerts",
      icon: AlertTriangle,
      testId: "nav-admin-fraud",
    },
    {
      title: "Bônus & Promoções",
      url: "/admin/bonuses",
      icon: Gift,
      testId: "nav-admin-bonuses",
    },
    {
      title: "Configurações",
      url: "/admin/settings",
      icon: Settings,
      testId: "nav-admin-settings",
    },
  ];

  const isAdmin = user?.role === "admin";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg casino-card-glow">
            <PandaIcon className="h-8 w-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Panda Loterias
            </span>
            <span className="text-xs text-muted-foreground">Cassino & Loterias</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={item.testId}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={item.testId}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 casino-card-glow">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-primary-foreground font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
              {isAdmin && (
                <Badge className="text-[10px] px-1 py-0 bg-primary text-primary-foreground">
                  ADMIN
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-destructive/20 hover:bg-destructive/10"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? "Saindo..." : "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}





