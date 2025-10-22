#!/bin/bash

# Script para criar banco de dados e usuário PostgreSQL
# Execute como root ou com sudo

set -e

echo "🗄️ Configurando banco de dados PostgreSQL..."

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

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    error "PostgreSQL não está instalado!"
    echo "Instale com: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Verificar se PostgreSQL está rodando
if ! systemctl is-active --quiet postgresql; then
    log "🔄 Iniciando PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Configurações
DB_NAME="pandasloterias"
DB_USER="pandas_jcweb"
DB_PASSWORD="Jj32631122@"

log "📝 Criando usuário e banco de dados..."

# Criar usuário e banco via SQL
sudo -u postgres psql << EOF
-- Verificar se usuário já existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'Usuário $DB_USER criado';
    ELSE
        RAISE NOTICE 'Usuário $DB_USER já existe';
    END IF;
END
\$\$;

-- Verificar se banco já existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
        CREATE DATABASE $DB_NAME OWNER $DB_USER;
        RAISE NOTICE 'Banco $DB_NAME criado';
    ELSE
        RAISE NOTICE 'Banco $DB_NAME já existe';
    END IF;
END
\$\$;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Conectar ao banco e dar permissões nas tabelas
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Configurar permissões futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

# Testar conexão
log "🔍 Testando conexão..."
if psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1; then
    success "✅ Conexão com banco de dados funcionando!"
else
    error "❌ Erro ao conectar com banco de dados"
fi

# Verificar se pg_isready funciona
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 -U $DB_USER >/dev/null 2>&1; then
        success "✅ PostgreSQL está respondendo"
    else
        warning "⚠️ PostgreSQL pode não estar respondendo corretamente"
    fi
fi

success "🎉 Banco de dados configurado com sucesso!"
echo ""
echo "📋 Informações da conexão:"
echo "   • Host: localhost"
echo "   • Porta: 5432"
echo "   • Banco: $DB_NAME"
echo "   • Usuário: $DB_USER"
echo "   • Senha: $DB_PASSWORD"
echo ""
echo "🔗 String de conexão:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "📝 Próximos passos:"
echo "   1. Execute: npm run db:setup"
echo "   2. Execute: npm run deploy"
echo ""
