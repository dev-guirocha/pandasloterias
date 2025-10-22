import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/use-notifications";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

export default function NotificationsPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notifyDeposit, setNotifyDeposit] = useState(true);
  const [notifyWithdrawal, setNotifyWithdrawal] = useState(true);
  const [notifyBetWin, setNotifyBetWin] = useState(true);
  const [notifyKycStatus, setNotifyKycStatus] = useState(true);
  const [notifyBonus, setNotifyBonus] = useState(true);

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.emailEnabled);
      setSmsEnabled(preferences.smsEnabled);
      setPhoneNumber(preferences.phoneNumber || "");
      setNotifyDeposit(preferences.notifyDeposit);
      setNotifyWithdrawal(preferences.notifyWithdrawal);
      setNotifyBetWin(preferences.notifyBetWin);
      setNotifyKycStatus(preferences.notifyKycStatus);
      setNotifyBonus(preferences.notifyBonus);
    }
  }, [preferences]);

  const handleSave = () => {
    updateMutation.mutate({
      emailEnabled,
      smsEnabled,
      phoneNumber: phoneNumber || null,
      notifyDeposit,
      notifyWithdrawal,
      notifyBetWin,
      notifyKycStatus,
      notifyBonus,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6" data-testid="div-loading-preferences">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="div-notifications-preferences">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Bell className="w-8 h-8" />
          Preferências de Notificação
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Gerencie como você deseja receber notificações sobre sua conta
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="card-notification-channels">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Canais de Notificação
            </CardTitle>
            <CardDescription>
              Escolha como você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled" className="text-base">Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações por email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
                data-testid="switch-email-enabled"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="sms-enabled" className="text-base">SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações por SMS
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={smsEnabled}
                onCheckedChange={setSmsEnabled}
                data-testid="switch-sms-enabled"
              />
            </div>

            {smsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="phone-number">Número de Telefone</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+55 (11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-phone-number"
                />
                <p className="text-sm text-muted-foreground">
                  Necessário para receber notificações por SMS
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-notification-events">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Tipos de Notificação
            </CardTitle>
            <CardDescription>
              Escolha quais eventos você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-deposit" className="text-base">Depósitos</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando você fizer um depósito
                </p>
              </div>
              <Switch
                id="notify-deposit"
                checked={notifyDeposit}
                onCheckedChange={setNotifyDeposit}
                data-testid="switch-notify-deposit"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-withdrawal" className="text-base">Saques</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando você solicitar um saque
                </p>
              </div>
              <Switch
                id="notify-withdrawal"
                checked={notifyWithdrawal}
                onCheckedChange={setNotifyWithdrawal}
                data-testid="switch-notify-withdrawal"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-bet-win" className="text-base">Apostas Vencedoras</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações quando você ganhar uma aposta
                </p>
              </div>
              <Switch
                id="notify-bet-win"
                checked={notifyBetWin}
                onCheckedChange={setNotifyBetWin}
                data-testid="switch-notify-bet-win"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-kyc" className="text-base">Status KYC</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre verificação de identidade
                </p>
              </div>
              <Switch
                id="notify-kyc"
                checked={notifyKycStatus}
                onCheckedChange={setNotifyKycStatus}
                data-testid="switch-notify-kyc"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-bonus" className="text-base">Bônus</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre bônus e promoções
                </p>
              </div>
              <Switch
                id="notify-bonus"
                checked={notifyBonus}
                onCheckedChange={setNotifyBonus}
                data-testid="switch-notify-bonus"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-preferences"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      </div>
    </div>
  );
}
