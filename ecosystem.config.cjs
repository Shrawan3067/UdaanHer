// ==============================================================================
// UdaanHer PM2 Process Manager Configuration for AWS EC2
// Giving women wings to fly
// ==============================================================================

module.exports = {
  apps: [
    {
      name: 'udaanher-backend',
      cwd: './server',
      script: './dist/server.js',
      instances: 1, // Use 'max' or 2 for multi-core instances, 1 for t2/t3.micro
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_file: './.env',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 8000,
    },
  ],
};

