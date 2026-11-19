const path = require("node:path");

const base = "/usr/soso/group-rank";
const release =
  process.env.GROUP_RANK_RELEASE_ROOT || path.join(base, "current");

module.exports = {
  apps: [
    {
      name: "group-rank-test",
      cwd: path.join(release, "apps/backend-nest"),
      script: "dist/group-rank/main.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      restart_delay: 3000,
      max_memory_restart: "256M",
      watch: false,
      time: true,
      merge_logs: true,
      out_file: path.join(base, "logs/api.out.log"),
      error_file: path.join(base, "logs/api.err.log"),
      env: {
        NODE_ENV: "production",
        GROUP_RANK_ENV_FILE: path.join(base, "shared/runtime.env"),
      },
    },
  ],
};
