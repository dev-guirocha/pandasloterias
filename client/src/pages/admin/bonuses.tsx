import { useState } from "react";
import { useAdminBonuses, useCreatePromotion } from "@/hooks/use-bonuses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const promotionSchema = z.object({
  type: z.enum(["promotion", "deposit_match", "cashback"]),
  amount: z.string().min(1, "Valor obrigatório"),
  wagerRequirement: z.string().optional(),
  code: z.string().optional(),
  description: z.string().min(1, "Descrição obrigatória"),
  expiresAt: z.string().optional(),
});

type PromotionForm = z.infer<typeof promotionSchema>;

export default function AdminBonuses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: bonuses, isLoading } = useAdminBonuses();
  const createPromotion = useCreatePromotion();
  const { toast } = useToast();

  const form = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      type: "promotion",
      amount: "",
      wagerRequirement: "0",
      code: "",
      description: "",
      expiresAt: "",
    },
  });

  const onSubmit = async (data: PromotionForm) => {
    try {
      await createPromotion.mutateAsync({
        type: data.type,
        amount: parseFloat(data.amount),
        wagerRequirement: data.wagerRequirement ? parseFloat(data.wagerRequirement) : 0,
        code: data.code || undefined,
        description: data.description,
        expiresAt: data.expiresAt || undefined,
      });
      
      toast({
        title: "Promoção criada!",
        description: "A promoção foi criada com sucesso",
      });
      
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a promoção",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Gerenciar Bônus</h1>
          <p className="text-muted-foreground">
            Crie e gerencie promoções para seus usuários
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-promotion">
              <Plus className="w-4 h-4 mr-2" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Promoção</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Bônus</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-bonus-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="promotion">Promoção</SelectItem>
                          <SelectItem value="deposit_match">Match de Depósito</SelectItem>
                          <SelectItem value="cashback">Cashback</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a promoção..."
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wagerRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rollover (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-wager"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Promocional (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="PROMO2024"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            data-testid="input-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expira em (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            data-testid="input-expires"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createPromotion.isPending} data-testid="button-submit-promotion">
                    {createPromotion.isPending ? "Criando..." : "Criar Promoção"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bonuses List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : !bonuses || bonuses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma promoção criada ainda
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bonuses.map((bonus) => (
            <Card key={bonus.id} className="hover-elevate" data-testid={`card-admin-bonus-${bonus.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">
                        {getBonusTypeLabel(bonus.type)}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {bonus.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-primary">
                    R$ {parseFloat(bonus.amount).toFixed(2)}
                  </span>
                </div>
                
                {parseFloat(bonus.wagerRequirement || "0") > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rollover:</span>
                    <span className="font-medium">
                      R$ {parseFloat(bonus.wagerRequirement!).toFixed(2)}
                    </span>
                  </div>
                )}

                {bonus.code && (
                  <div className="pt-3 border-t">
                    <span className="text-xs text-muted-foreground">Código:</span>
                    <span className="ml-2 font-mono font-semibold">{bonus.code}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {bonus.status}
                  </Badge>
                  {bonus.expiresAt && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(bonus.expiresAt).toLocaleDateString("pt-BR")}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
