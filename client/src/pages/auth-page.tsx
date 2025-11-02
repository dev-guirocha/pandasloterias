import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, TrendingUp, Lock, Award, Eye, EyeOff } from "lucide-react";
import AuroraBackground from "@/components/effects/aurora-background";
import PandaIcon from "@/components/icons/panda";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Usuário obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      cpf: "",
      phone: "",
    },
  });

  // Redirect if already logged in (after all hooks)
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof insertUserSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex relative">
      <AuroraBackground />
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link
              href="/"
              title="Voltar à Home"
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg casino-card-glow mb-4 cursor-pointer transition-transform hover:scale-[1.03]"
            >
              <PandaIcon className="h-12 w-12" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gradient-casino">Panda Loterias</h1>
            <p className="text-muted-foreground">
              Cassino, Loterias e Jogo do Bicho Online
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Card className="card-glass">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
                  <CardDescription>
                    Digite suas credenciais para acessar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuário</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="seu_usuario"
                                data-testid="input-login-username"
                                autoComplete="username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="login-password">Senha</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  id="login-password"
                                  type={showLoginPassword ? "text" : "password"}
                                  placeholder="Sua senha"
                                  data-testid="input-login-password"
                                  autoComplete="current-password"
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground hover:text-foreground"
                                onClick={() => setShowLoginPassword((v) => !v)}
                                aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Entrar
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <Card className="card-glass">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Criar nova conta</CardTitle>
                  <CardDescription>
                    Preencha os dados para começar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="João Silva"
                                data-testid="input-register-fullname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="joao@exemplo.com"
                                data-testid="input-register-email"
                                autoComplete="email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usuário</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="joaosilva"
                                  data-testid="input-register-username"
                                  autoComplete="username"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="00000000000"
                                  maxLength={11}
                                  data-testid="input-register-cpf"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="(11) 99999-9999"
                                data-testid="input-register-phone"
                                autoComplete="tel"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="register-password">Senha</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  id="register-password"
                                  type={showRegisterPassword ? "text" : "password"}
                                  placeholder="Mínimo 6 caracteres"
                                  data-testid="input-register-password"
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground hover:text-foreground"
                                onClick={() => setShowRegisterPassword((v) => !v)}
                                aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                              >
                                {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register-submit"
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Criar Conta
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Criptografado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-gradient-to-br from-emerald-700/30 via-amber-800/10 to-background items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0tMTYgMGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 max-w-lg space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Bem-vindo à Panda Loterias
            </h2>
            <p className="text-xl text-muted-foreground">
              Cassino online, loterias e jogo do bicho com segurança e transparência total
            </p>
          </div>

          <div className="grid gap-6 pt-8">
            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">100% Seguro e ConfiÃ¡vel</h3>
                <p className="text-sm text-muted-foreground">
                  KYC completo, transações criptografadas e auditoria em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Saque Rápido e Fácil</h3>
                <p className="text-sm text-muted-foreground">
                  PIX instantâneo, cartões e mÃºltiplas formas de pagamento
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Variedade de Jogos</h3>
                <p className="text-sm text-muted-foreground">
                  Cassino, loterias oficiais e jogo do bicho online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








