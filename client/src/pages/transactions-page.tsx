import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowDownRight, 
  ArrowUpRight,
  Trophy,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsPage() {
  const { transactions = [], isLoading } = useTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case "withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "bet_stake":
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case "bet_win":
        return <Trophy className="h-4 w-4 text-green-500" />;
      case "bonus":
        return <Gift className="h-4 w-4 text-primary" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" /> Concluído</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pendente</Badge>;
      case "processing":
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Processando</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Falhou</Badge>;
      case "cancelled":
        return <Badge variant="outline"><XCircle className="mr-1 h-3 w-3" /> Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: "Depósito",
      withdraw: "Saque",
      bet_stake: "Aposta",
      bet_win: "Ganho",
      bet_refund: "Reembolso",
      bonus: "Bônus",
      adjustment: "Ajuste",
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return "-";
    const labels: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      crypto: "Criptomoeda",
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Histórico de Transações</h1>
        <p className="text-muted-foreground mt-1">
          Visualize todas as suas transações financeiras
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações</CardTitle>
          <CardDescription>
            Histórico completo de depósitos, saques e apostas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="font-medium">{getTypeLabel(tx.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-semibold ${
                          parseFloat(tx.amount) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {parseFloat(tx.amount) >= 0 ? '+' : ''}R$ {Math.abs(parseFloat(tx.amount)).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getPaymentMethodLabel(tx.method)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('pt-BR')} {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
