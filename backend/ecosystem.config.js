module.exports = {
  apps: [
    {
      name: "missrezanna-api",
      script: "./src/server.js",
      instances: "max", // Scale across all available CPU cores
      exec_mode: "cluster", // Enable Node.js cluster mode for load balancing
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    },
    {
      name: "missrezanna-worker",
      script: "./src/jobs/bullmq.js",
      instances: 1, // Only 1 worker process so jobs aren't processed multiple times unexpectedly unless configured
      watch: false
    }
  ]
};
