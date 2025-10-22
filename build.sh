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
npm run db:setup
pm2 start ecosystem.config.cjs
pm2 restart pandasloterias
pm2 status