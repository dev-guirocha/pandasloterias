#!/bin/bash

# Script de Rollback - PandasLoterias
# Este script faz rollback para a versão anterior em caso de problemas

set -e

echo "🔄 Iniciando rollback do PandasLoterias..."

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

# Verificar se existem backups
BACKUP_DIRS=($(ls -d dist_backup_* 2>/dev/null | sort -r))

if [ ${#BACKUP_DIRS[@]} -eq 0 ]; then
    error "Nenhum backup encontrado para rollback!"
fi

echo "📦 Backups disponíveis:"
for i in "${!BACKUP_DIRS[@]}"; do
    echo "   $((i+1)). ${BACKUP_DIRS[$i]}"
done

# Usar o backup mais recente por padrão
LATEST_BACKUP=${BACKUP_DIRS[0]}
log "🔄 Usando backup mais recente: $LATEST_BACKUP"

# Confirmar rollback
read -p "⚠️ Tem certeza que deseja fazer rollback? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "❌ Rollback cancelado pelo usuário"
    exit 0
fi

# 1. Parar aplicação atual
log "🛑 Parando aplicação atual..."
pm2 stop pandasloterias 2>/dev/null || warning "Aplicação não estava rodando"

# 2. Backup do estado atual (caso queira voltar)
if [ -d "dist" ]; then
    log "📦 Fazendo backup do estado atual..."
    cp -r dist dist_current_$(date +%Y%m%d_%H%M%S)
fi

# 3. Restaurar backup
log "🔄 Restaurando backup: $LATEST_BACKUP"
rm -rf dist
cp -r "$LATEST_BACKUP" dist

# 4. Verificar se o backup é válido
if [ ! -f "dist/index.js" ]; then
    error "Backup inválido! dist/index.js não encontrado."
fi

# 5. Reiniciar aplicação
log "🚀 Reiniciando aplicação..."
pm2 start ecosystem.config.cjs

# 6. Verificar status
log "📊 Verificando status..."
sleep 3
pm2 status

# 7. Testar aplicação
log "🔍 Testando aplicação..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    success "✅ Rollback concluído com sucesso!"
    echo ""
    echo "📋 Informações do Rollback:"
    echo "   • Backup restaurado: $LATEST_BACKUP"
    echo "   • Estado atual salvo em: dist_current_*"
    echo "   • Aplicação rodando na porta 3000"
    echo ""
else
    warning "⚠️ Aplicação pode não estar respondendo corretamente"
    echo "   Verifique os logs: pm2 logs pandasloterias"
fi
