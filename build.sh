#!/bin/bash

# Script de Deploy - PandasLoterias
# Este script faz o build e deploy da aplicação

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do PandasLoterias..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
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

# 1. Backup do build anterior (se existir)
if [ -d "dist" ]; then
    log "📦 Fazendo backup do build anterior..."
    cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S) || warning "Não foi possível fazer backup"
fi

# 2. Parar aplicação PM2
log "🛑 Parando aplicação PM2..."
pm2 delete pandasloterias 2>/dev/null || warning "Aplicação não estava rodando"

# 3. Instalar dependências
log "📦 Instalando dependências..."
npm install --production=false

# 4. Verificar se PostgreSQL está rodando
log "🗄️ Verificando conexão com PostgreSQL..."
if ! pg_isready -h localhost -p 5432 -U pandas_jcweb >/dev/null 2>&1; then
    warning "PostgreSQL não está respondendo. Verifique se está rodando."
fi

# 5. Executar migrações do banco (se necessário)
log "🔄 Verificando migrações do banco..."
npm run db:push || warning "Erro nas migrações do banco"

# 6. Build da aplicação
log "🔨 Fazendo build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -f "dist/index.js" ]; then
    error "Build falhou! dist/index.js não foi criado."
fi

# 7. Iniciar aplicação com PM2
log "🚀 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.cjs

# 8. Verificar status
log "📊 Verificando status da aplicação..."
sleep 3
pm2 status

# 9. Verificar se a aplicação está respondendo
log "🔍 Testando aplicação..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    success "✅ Aplicação está rodando corretamente!"
else
    warning "⚠️ Aplicação pode não estar respondendo corretamente"
fi

# 10. Limpeza
log "🧹 Limpando arquivos temporários..."
rm -rf dist_backup_* 2>/dev/null || true

success "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Informações do Deploy:"
echo "   • Aplicação: pandasloterias"
echo "   • Porta: 3000"
echo "   • Logs: /var/log/pandasloterias/"
echo "   • Status: pm2 status"
echo "   • Logs em tempo real: pm2 logs pandasloterias"
echo ""