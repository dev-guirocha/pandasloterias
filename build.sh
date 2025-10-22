#!/bin/bash

# Carregar variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Variáveis do .env carregadas"
else
    echo "⚠️ Arquivo .env não encontrado"
fi

# Deploy completo
pm2 delete pandasloterias
npm install
npm run build

# Criar tabelas diretamente
echo "🗄️ Criando tabelas no banco de dados..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
    echo "✅ Tabelas criadas com sucesso!"
else
    echo "❌ Erro ao criar tabelas"
    exit 1
fi

pm2 start ecosystem.config.cjs
pm2 status