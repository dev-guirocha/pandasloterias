module.exports = {
    apps: [{
      name: 'pandasloterias',
      script: 'dist/index.js',
      cwd: '/var/www/html/pandasloterias',
      instances: 1,  // Apenas 1 instância
      exec_mode: 'fork',  // Modo fork
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://pandas_jcweb:Jj32631122%40@localhost:5432/pandasloterias',
        SESSION_SECRET: 'Jj32631122.',
        APP_URL: 'https://pandas.jcwebsoftware.cloud',
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
    }]
  };
  