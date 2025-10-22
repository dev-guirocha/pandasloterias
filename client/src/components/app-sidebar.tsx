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
import { Button } from "@/components/ui/button";

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
      icon: Trophy,
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
      title: "Usuários",
      url: "/admin/users",
      icon: Users,
      testId: "nav-admin-users",
    },
    {
      title: "Aprovações KYC",
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">BetPlatform</span>
            <span className="text-xs text-muted-foreground">Casino & Lottery</span>
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

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-sidebar-accent">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
