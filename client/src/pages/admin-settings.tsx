import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Palette, Type, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  platformName: z.string().min(1, "Nome da plataforma é obrigatório"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor primária deve ser um código hexadecimal válido"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor de acento deve ser um código hexadecimal válido"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      platformName: (settings as any).platformName || "BetPlatform",
      primaryColor: (settings as any).primaryColor || "#10b981",
      accentColor: (settings as any).accentColor || "#8b5cf6",
    } : {
      platformName: "BetPlatform",
      primaryColor: "#10b981",
      accentColor: "#8b5cf6",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await apiRequest("PATCH", "/api/admin/settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações da plataforma foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Configurações da Plataforma</h1>
        <p className="text-muted-foreground mt-1">
          Personalize a aparência e informações da sua plataforma
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  <CardTitle>Informações Básicas</CardTitle>
                </div>
                <CardDescription>
                  Configure o nome e a identidade visual da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="platformName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Plataforma</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="BetPlatform" 
                          {...field}
                          data-testid="input-platform-name"
                        />
                      </FormControl>
                      <FormDescription>
                        Este nome aparecerá na landing page e no cabeçalho do site
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Cores do Tema</CardTitle>
                </div>
                <CardDescription>
                  Escolha as cores principais da sua plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Primária</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              type="color" 
                              className="h-10 w-16 cursor-pointer"
                              {...field}
                              data-testid="input-primary-color"
                            />
                          </FormControl>
                          <FormControl>
                            <Input 
                              placeholder="#10b981" 
                              {...field}
                              className="flex-1"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Cor principal usada em botões e destaques
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor de Acento</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              type="color" 
                              className="h-10 w-16 cursor-pointer"
                              {...field}
                              data-testid="input-accent-color"
                            />
                          </FormControl>
                          <FormControl>
                            <Input 
                              placeholder="#8b5cf6" 
                              {...field}
                              className="flex-1"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Cor secundária para elementos de destaque
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium mb-3">Pré-visualização</h4>
                  <div className="flex gap-2">
                    <div 
                      className="h-10 w-20 rounded border"
                      style={{ backgroundColor: form.watch("primaryColor") }}
                    />
                    <div 
                      className="h-10 w-20 rounded border"
                      style={{ backgroundColor: form.watch("accentColor") }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg"
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
