#!/bin/bash

# Script de Health Check - PandasLoterias
# Este script verifica a saúde da aplicação e do sistema

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
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🏥 Health Check - PandasLoterias"
echo "================================"

# 1. Verificar PM2
log "🔍 Verificando PM2..."
if pm2 list | grep -q "pandasloterias"; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="pandasloterias") | .pm2_env.status')
    if [ "$STATUS" = "online" ]; then
        success "✅ PM2: Aplicação está online"
    else
        error "❌ PM2: Aplicação está $STATUS"
    fi
else
    error "❌ PM2: Aplicação não encontrada"
fi

# 2. Verificar porta
log "🔍 Verificando porta 3000..."
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    success "✅ Porta 3000: Em uso"
else
    error "❌ Porta 3000: Não está em uso"
fi

# 3. Verificar PostgreSQL
log "🔍 Verificando PostgreSQL..."
if pg_isready -h localhost -p 5432 -U pandas_jcweb >/dev/null 2>&1; then
    success "✅ PostgreSQL: Conectado"
else
    error "❌ PostgreSQL: Não está respondendo"
fi

# 4. Verificar resposta HTTP
log "🔍 Verificando resposta HTTP..."
if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
    success "✅ HTTP: Aplicação respondendo"
else
    error "❌ HTTP: Aplicação não está respondendo"
fi

# 5. Verificar uso de memória
log "🔍 Verificando uso de memória..."
MEMORY_USAGE=$(pm2 jlist | jq -r '.[] | select(.name=="pandasloterias") | .monit.memory / 1024 / 1024' | cut -d. -f1)
if [ "$MEMORY_USAGE" -lt 500 ]; then
    success "✅ Memória: ${MEMORY_USAGE}MB (OK)"
elif [ "$MEMORY_USAGE" -lt 1000 ]; then
    warning "⚠️ Memória: ${MEMORY_USAGE}MB (Alto)"
else
    error "❌ Memória: ${MEMORY_USAGE}MB (Muito alto)"
fi

# 6. Verificar uptime
log "🔍 Verificando uptime..."
UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="pandasloterias") | .pm2_env.uptime')
UPTIME_HOURS=$((UPTIME / 3600))
if [ "$UPTIME_HOURS" -gt 0 ]; then
    success "✅ Uptime: ${UPTIME_HOURS}h"
else
    warning "⚠️ Uptime: Menos de 1 hora"
fi

# 7. Verificar logs de erro
log "🔍 Verificando logs de erro..."
ERROR_COUNT=$(tail -n 100 /var/log/pandasloterias/error.log 2>/dev/null | grep -c "ERROR" || echo "0")
if [ "$ERROR_COUNT" -eq 0 ]; then
    success "✅ Logs: Nenhum erro recente"
elif [ "$ERROR_COUNT" -lt 5 ]; then
    warning "⚠️ Logs: $ERROR_COUNT erros recentes"
else
    error "❌ Logs: $ERROR_COUNT erros recentes"
fi

# 8. Verificar espaço em disco
log "🔍 Verificando espaço em disco..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    success "✅ Disco: ${DISK_USAGE}% usado"
elif [ "$DISK_USAGE" -lt 90 ]; then
    warning "⚠️ Disco: ${DISK_USAGE}% usado"
else
    error "❌ Disco: ${DISK_USAGE}% usado (Crítico)"
fi

echo ""
echo "📊 Resumo do Health Check:"
echo "   • Aplicação: $(pm2 jlist | jq -r '.[] | select(.name=="pandasloterias") | .pm2_env.status')"
echo "   • Memória: ${MEMORY_USAGE}MB"
echo "   • Uptime: ${UPTIME_HOURS}h"
echo "   • Erros recentes: $ERROR_COUNT"
echo "   • Disco: ${DISK_USAGE}%"
echo ""
echo "📋 Comandos úteis:"
echo "   • Ver logs: pm2 logs pandasloterias"
echo "   • Reiniciar: pm2 restart pandasloterias"
echo "   • Status: pm2 status"
echo ""
