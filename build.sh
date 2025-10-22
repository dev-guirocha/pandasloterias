#!/bin/bash

# Carregar variáveis do .env
if [ -f .env ]; then
    # Carregar variáveis linha por linha para evitar problemas
    while IFS= read -r line; do
        # Pular linhas vazias e comentários
        if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
            export "$line"
        fi
    done < .env
    echo "✅ Variáveis do .env carregadas"
else
    echo "⚠️ Arquivo .env não encontrado"
fi

# Deploy completo
pm2 delete pandasloterias
npm install
npm run build

# Verificar se DATABASE_URL está carregada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrada!"
    echo "Verificando arquivo .env..."
    cat .env | grep DATABASE_URL
    exit 1
fi

echo "📊 DATABASE_URL: $DATABASE_URL"

# Criar tabelas diretamente
echo "🗄️ Criando tabelas no banco de dados..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
    echo "✅ Tabelas criadas com sucesso!"
else
    echo "❌ Erro ao criar tabelas"
    echo "Tentando com variável explícita..."
    DATABASE_URL="$DATABASE_URL" npx drizzle-kit push
fi

pm2 start ecosystem.config.cjs
pm2 status