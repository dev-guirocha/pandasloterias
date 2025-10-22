# 🚀 Guia de Deploy - PandasLoterias

Este guia explica como fazer deploy da aplicação PandasLoterias usando PM2 e os scripts automatizados.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL rodando localmente
- PM2 instalado globalmente: `npm install -g pm2`
- Permissões de escrita em `/var/log/pandasloterias/`

## 🛠️ Scripts Disponíveis

### Scripts NPM

```bash
# Deploy completo (recomendado)
npm run deploy

# Gerenciamento PM2
npm run pm2:start      # Iniciar aplicação
npm run pm2:stop       # Parar aplicação
npm run pm2:restart    # Reiniciar aplicação
npm run pm2:delete     # Remover aplicação
npm run pm2:status     # Ver status
npm run pm2:logs       # Ver logs em tempo real

# Rollback e monitoramento
npm run rollback       # Voltar para versão anterior
npm run health         # Verificar saúde da aplicação

# Banco de dados
npm run db:setup       # Configurar banco
npm run db:push        # Aplicar migrações
npm run db:studio      # Interface visual do banco
```

### Scripts Diretos

```bash
# Deploy completo
./build.sh

# Rollback
./rollback.sh

# Health check
./health-check.sh
```

## 🚀 Processo de Deploy

### 1. Deploy Automático (Recomendado)

```bash
# Deploy completo com verificações
npm run deploy
```

Este comando:
- ✅ Faz backup da versão anterior
- ✅ Para a aplicação atual
- ✅ Instala dependências
- ✅ Verifica conexão com PostgreSQL
- ✅ Executa migrações do banco
- ✅ Faz build da aplicação
- ✅ Inicia com PM2
- ✅ Verifica se está funcionando
- ✅ Limpa arquivos temporários

### 2. Deploy Manual

```bash
# 1. Parar aplicação
pm2 stop pandasloterias

# 2. Instalar dependências
npm install

# 3. Build
npm run build

# 4. Migrações (se necessário)
npm run db:push

# 5. Iniciar aplicação
pm2 start ecosystem.config.cjs

# 6. Verificar status
pm2 status
```

## 🔄 Rollback

Em caso de problemas, use o rollback:

```bash
# Rollback automático
npm run rollback

# Ou manual
./rollback.sh
```

O rollback:
- ✅ Para a aplicação atual
- ✅ Faz backup do estado atual
- ✅ Restaura a versão anterior
- ✅ Reinicia a aplicação
- ✅ Verifica se está funcionando

## 🏥 Monitoramento

### Health Check

```bash
# Verificar saúde da aplicação
npm run health
```

Verifica:
- ✅ Status do PM2
- ✅ Porta 3000
- ✅ Conexão PostgreSQL
- ✅ Resposta HTTP
- ✅ Uso de memória
- ✅ Uptime
- ✅ Logs de erro
- ✅ Espaço em disco

### Logs

```bash
# Logs em tempo real
npm run pm2:logs

# Logs específicos
tail -f /var/log/pandasloterias/combined.log
tail -f /var/log/pandasloterias/error.log
```

## 📊 Configuração PM2

O arquivo `ecosystem.config.cjs` está configurado com:

```javascript
{
  name: 'pandasloterias',
  script: 'dist/index.js',
  cwd: '/var/www/html/pandasloterias',
  instances: 1,
  exec_mode: 'fork',
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
    DATABASE_URL: 'postgresql://pandas_jcweb:Jj32631122%40@localhost:5432/pandasloterias',
    SESSION_SECRET: 'Jj32631122.',
    APP_URL: 'https://pandasloterias.jcwebsoftware.cloud',
    USE_HTTPS: 'false'
  },
  error_file: '/var/log/pandasloterias/error.log',
  out_file: '/var/log/pandasloterias/out.log',
  log_file: '/var/log/pandasloterias/combined.log',
  time: true,
  max_memory_restart: '1G',
  restart_delay: 4000,
  max_restarts: 10,
  min_uptime: '10s'
}
```

## 🔧 Solução de Problemas

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs pandasloterias

# Verificar se a porta está livre
netstat -tlnp | grep :3000

# Verificar PostgreSQL
pg_isready -h localhost -p 5432 -U pandas_jcweb
```

### Erro de permissão

```bash
# Dar permissões aos scripts
chmod +x build.sh rollback.sh health-check.sh

# Criar diretório de logs
sudo mkdir -p /var/log/pandasloterias
sudo chown $USER:$USER /var/log/pandasloterias
```

### Erro de banco de dados

```bash
# Verificar conexão
psql -h localhost -U pandas_jcweb -d pandasloterias

# Executar migrações
npm run db:push

# Reset do banco (cuidado!)
npm run db:setup
```

### Aplicação lenta

```bash
# Verificar uso de memória
pm2 monit

# Reiniciar aplicação
pm2 restart pandasloterias

# Verificar logs de erro
tail -f /var/log/pandasloterias/error.log
```

## 📈 Monitoramento Avançado

### PM2 Monitor

```bash
# Interface visual
pm2 monit
```

### Logs Rotativos

```bash
# Configurar rotação de logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Automático

```bash
# Criar backup do banco
pg_dump -h localhost -U pandas_jcweb -d pandasloterias > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🚨 Alertas

Configure alertas para:
- Uso de memória > 80%
- Uptime < 1 hora
- Erros > 10 por hora
- Espaço em disco > 90%

## 📝 Logs Importantes

- **Aplicação**: `/var/log/pandasloterias/`
- **PostgreSQL**: `/var/log/postgresql/`
- **Sistema**: `/var/log/syslog`

## 🔐 Segurança

- ✅ Senhas em variáveis de ambiente
- ✅ Logs com rotação automática
- ✅ Restart automático em caso de falha
- ✅ Limite de memória configurado
- ✅ Backup automático antes do deploy
