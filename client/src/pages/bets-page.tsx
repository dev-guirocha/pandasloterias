import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBets } from "@/hooks/use-bets";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Clock,
  CheckCircle2,
  XCircle,
  Dices,
  Ticket,
  Hash,
  Info
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BetsPage() {
  const { bets = [], isLoading } = useBets();

  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case "casino":
        return <Dices className="h-4 w-4 text-purple-500" />;
      case "lottery":
        return <Ticket className="h-4 w-4 text-blue-500" />;
      case "jogo_bicho":
        return <Hash className="h-4 w-4 text-green-500" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" /> Ganhou</Badge>;
      case "lost":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Perdeu</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pendente</Badge>;
      case "active":
        return <Badge variant="default"><Trophy className="mr-1 h-3 w-3" /> Ativo</Badge>;
      case "refunded":
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGameTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      casino: "Cassino",
      lottery: "Loteria",
      jogo_bicho: "Jogo do Bicho",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Minhas Apostas</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas apostas ativas e histórico de resultados
        </p>
      </div>

      {/* Info Alert - Ready for External API */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Os jogos serão integrados via API externa. A estrutura está pronta para receber dados em tempo real.
        </AlertDescription>
      </Alert>

      {/* Game Categories */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover-elevate cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Dices className="h-8 w-8 text-purple-500" />
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <CardTitle className="mt-2">Cassino</CardTitle>
            <CardDescription>Roleta, Blackjack, Slots</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Ticket className="h-8 w-8 text-blue-500" />
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <CardTitle className="mt-2">Loterias</CardTitle>
            <CardDescription>Mega-Sena, Lotofácil, Quina</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Hash className="h-8 w-8 text-green-500" />
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <CardTitle className="mt-2">Jogo do Bicho</CardTitle>
            <CardDescription>Dezenas e Grupos</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Bets History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Apostas</CardTitle>
          <CardDescription>
            Todas as suas apostas e resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogo</TableHead>
                  <TableHead>Aposta</TableHead>
                  <TableHead>Prêmio Potencial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : bets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma aposta realizada</p>
                      <p className="text-sm mt-1">Comece apostando nos jogos disponíveis</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  bets.map((bet) => (
                    <TableRow key={bet.id} data-testid={`row-bet-${bet.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getGameTypeIcon(bet.gameType)}
                          <div>
                            <p className="font-medium">{bet.gameId || "Jogo do Sistema"}</p>
                            <p className="text-sm text-muted-foreground">{getGameTypeLabel(bet.gameType)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold">
                          R$ {parseFloat(bet.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-green-500">
                          R$ {parseFloat(bet.potentialWin || "0").toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(bet.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(bet.placedAt).toLocaleDateString('pt-BR')} {new Date(bet.placedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" data-testid={`button-view-bet-${bet.id}`}>
                          Ver Detalhes
                        </Button>
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
