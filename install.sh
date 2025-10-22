#!/bin/bash

# Script de Instalação Completa - PandasLoterias
# Execute na VPS após clonar do GitHub

set -e

echo "🚀 Instalando PandasLoterias na VPS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script na raiz do projeto."
fi

# 1. Atualizar sistema
log "📦 Atualizando sistema..."
sudo apt-get update -y

# 2. Instalar Node.js (se não tiver)
if ! command -v node &> /dev/null; then
    log "📦 Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log "✅ Node.js já instalado: $(node --version)"
fi

# 3. Instalar PM2 (se não tiver)
if ! command -v pm2 &> /dev/null; then
    log "📦 Instalando PM2..."
    sudo npm install -g pm2
else
    log "✅ PM2 já instalado: $(pm2 --version)"
fi

# 4. Instalar PostgreSQL (se não tiver)
if ! command -v psql &> /dev/null; then
    log "📦 Instalando PostgreSQL..."
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    log "✅ PostgreSQL já instalado"
fi

# 5. Instalar ferramentas úteis
log "📦 Instalando ferramentas úteis..."
sudo apt-get install -y curl jq

# 6. Criar diretório de logs
log "📁 Criando diretório de logs..."
sudo mkdir -p /var/log/pandasloterias
sudo chown $USER:$USER /var/log/pandasloterias

# 7. Instalar dependências da aplicação
log "📦 Instalando dependências da aplicação..."
npm install

# 8. Verificar se .env existe
if [ ! -f ".env" ]; then
    log "📝 Criando arquivo .env..."
    cat > .env << EOF
DATABASE_URL=postgresql://pandas_jcweb:Jj32631122%40@localhost:5432/pandasloterias
NODE_ENV=production
PORT=3000
SESSION_SECRET=Jj32631122.
APP_URL=https://pandasloterias.jcwebsoftware.cloud
USE_HTTPS=false
EOF
    success "✅ Arquivo .env criado"
else
    log "✅ Arquivo .env já existe"
fi

# 9. Configurar banco de dados
log "🗄️ Configurando banco de dados..."
if [ -f "setup-database.sh" ]; then
    chmod +x setup-database.sh
    sudo ./setup-database.sh
else
    warning "⚠️ Script setup-database.sh não encontrado"
    log "📝 Configure o banco manualmente:"
    echo "   sudo -u postgres psql"
    echo "   CREATE USER pandas_jcweb WITH PASSWORD 'Jj32631122@';"
    echo "   CREATE DATABASE pandasloterias OWNER pandas_jcweb;"
    echo "   GRANT ALL PRIVILEGES ON DATABASE pandasloterias TO pandas_jcweb;"
    echo "   \\q"
fi

# 10. Configurar tabelas
log "🔄 Configurando tabelas do banco..."
npm run db:setup || warning "Erro ao configurar tabelas"

# 11. Fazer build
log "🔨 Fazendo build da aplicação..."
npm run build

# 12. Deploy com PM2
log "🚀 Fazendo deploy..."
if [ -f "build.sh" ]; then
    chmod +x build.sh
    ./build.sh
else
    log "📝 Deploy manual:"
    pm2 start ecosystem.config.cjs
fi

# 13. Verificar status
log "📊 Verificando status..."
sleep 3
pm2 status

# 14. Testar aplicação
log "🔍 Testando aplicação..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    success "✅ Aplicação está rodando!"
else
    warning "⚠️ Aplicação pode não estar respondendo"
    log "Verifique os logs: pm2 logs pandasloterias"
fi

success "🎉 Instalação concluída!"
echo ""
echo "📋 Informações da Instalação:"
echo "   • Aplicação: pandasloterias"
echo "   • Porta: 3000"
echo "   • Logs: /var/log/pandasloterias/"
echo "   • Status: pm2 status"
echo "   • Logs em tempo real: pm2 logs pandasloterias"
echo "   • Interface do banco: npm run db:studio"
echo ""
echo "🔧 Comandos úteis:"
echo "   • Reiniciar: pm2 restart pandasloterias"
echo "   • Parar: pm2 stop pandasloterias"
echo "   • Deploy: npm run deploy"
echo "   • Health check: npm run health"
echo ""
