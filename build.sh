pm2 delete pandasloterias
pm2 start ecosystem.config.cjs
npm install
npm run build
pm2 restart pandasloterias
pm2 status
npm run db:setup