import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight,
  CreditCard,
  Smartphone,
  AlertCircle,
  DollarSign
} from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const { depositMutation, withdrawMutation } = useTransactions();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const quickAmounts = ["50", "100", "200", "500", "1000"];
  const isKycApproved = user?.kycStatus === "approved" || user?.kycStatus === "under_review";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Carteira</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus depósitos, saques e saldo
        </p>
      </div>

      {/* Balance Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Saldo Disponível</CardTitle>
              <CardDescription>Disponível para apostas e saques</CardDescription>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-4xl lg:text-5xl font-mono font-bold" data-testid="text-wallet-balance">
              R$ {parseFloat(user?.balance || "0").toFixed(2)}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={!isKycApproved}
                    data-testid="button-open-deposit"
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Depositar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Depositar Fundos</DialogTitle>
                    <DialogDescription>
                      Escolha o valor e método de pagamento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Valor do Depósito</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="pl-9"
                          data-testid="input-deposit-amount"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quickAmounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount(amount)}
                            data-testid={`button-quick-${amount}`}
                          >
                            R$ {amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Método de Pagamento</Label>
                      <Select value={depositMethod} onValueChange={setDepositMethod}>
                        <SelectTrigger data-testid="select-deposit-method">
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              <span>PIX (Instantâneo)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="credit_card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Cartão de Crédito</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="debit_card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Cartão de Débito</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {depositMethod === "pix" && (
                      <Alert>
                        <Smartphone className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Você receberá um QR Code PIX para realizar o pagamento. 
                          O saldo é creditado instantaneamente após confirmação.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDepositOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        depositMutation.mutate({
                          amount: parseFloat(depositAmount),
                          paymentMethod: depositMethod,
                        });
                        setDepositOpen(false);
                        setDepositAmount("");
                        setDepositMethod("");
                      }}
                      disabled={!depositAmount || !depositMethod || depositMutation.isPending}
                      data-testid="button-confirm-deposit"
                    >
                      {depositMutation.isPending ? "Processando..." : "Continuar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    disabled={!isKycApproved || parseFloat(user?.balance || "0") <= 0}
                    data-testid="button-open-withdraw"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Sacar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sacar Fundos</DialogTitle>
                    <DialogDescription>
                      Informe o valor que deseja sacar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Valor do Saque</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-9"
                          max={user?.balance}
                          data-testid="input-withdraw-amount"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Disponível: R$ {parseFloat(user?.balance || "0").toFixed(2)}
                      </p>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Os saques via PIX são processados em até 24 horas úteis.
                        Verifique se seus dados bancários estão atualizados.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        withdrawMutation.mutate({
                          amount: parseFloat(withdrawAmount),
                        });
                        setWithdrawOpen(false);
                        setWithdrawAmount("");
                      }}
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) > parseFloat(user?.balance || "0") || withdrawMutation.isPending}
                      data-testid="button-confirm-withdraw"
                    >
                      {withdrawMutation.isPending ? "Processando..." : "Solicitar Saque"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isKycApproved && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="text-sm">
              Complete sua verificação KYC para habilitar depósitos e saques.
            </span>
            <Button variant="outline" size="sm" asChild>
              <a href="/kyc">Verificar Agora</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento Aceitos</CardTitle>
          <CardDescription>Todas as transações são seguras e criptografadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <Smartphone className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">PIX</p>
                <p className="text-sm text-muted-foreground">Instantâneo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Cartão de Crédito</p>
                <p className="text-sm text-muted-foreground">Até 12x sem juros</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Cartão de Débito</p>
                <p className="text-sm text-muted-foreground">À vista</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
