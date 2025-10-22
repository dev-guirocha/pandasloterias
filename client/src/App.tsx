import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "@/lib/protected-route";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import DashboardPage from "@/pages/dashboard-page";
import WalletPage from "@/pages/wallet-page";
import TransactionsPage from "@/pages/transactions-page";
import BetsPage from "@/pages/bets-page";
import KycPage from "@/pages/kyc-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminKyc from "@/pages/admin-kyc";
import FraudAlerts from "@/pages/admin/fraud-alerts";
import AdminBonuses from "@/pages/admin/bonuses";
import BonusesPage from "@/pages/bonuses-page";
import Analytics from "@/pages/admin/analytics";
import NotificationsPreferences from "@/pages/notifications-preferences";
import AdminSettings from "@/pages/admin-settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <ProtectedRoute path="/bets" component={BetsPage} />
      <ProtectedRoute path="/bonuses" component={BonusesPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPreferences} />
      <ProtectedRoute path="/kyc" component={KycPage} />
      <ProtectedRoute path="/admin" component={Analytics} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} />
      <ProtectedRoute path="/admin/kyc" component={AdminKyc} />
      <ProtectedRoute path="/admin/fraud-alerts" component={FraudAlerts} />
      <ProtectedRoute path="/admin/bonuses" component={AdminBonuses} />
      <ProtectedRoute path="/admin/analytics" component={Analytics} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { useWebSocket } from "@/hooks/use-websocket";

function AppContent() {
  const { user } = useAuth();
  useWebSocket(); // Initialize WebSocket for real-time updates
  
  // Sidebar configuration - wider for casino platform
  const style = {
    "--sidebar-width": "20rem",      // 320px for better navigation
    "--sidebar-width-icon": "4rem",  // default icon width
  };

  // If not authenticated, show router without sidebar
  if (!user) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
