module.exports = {
  apps: [
    {
      name: "savoy-ventures-os",
      script: "npm",
      args: "run start:production",
      cwd: "/var/www/savos",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        SAVOS_DATA_FILE: "/var/lib/savos/os-state.json",
      },
    },
  ],
};
