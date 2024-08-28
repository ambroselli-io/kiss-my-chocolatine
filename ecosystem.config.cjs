require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "medspot",
      script: "npm",
      args: "run start-pm2",
      env: {
        NODE_ENV: "production",
        APP_NAME: process.env.APP_NAME,
        APP_URL: process.env.APP_URL,
        SECRET: process.env.SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
        SENTRY_DSN: process.env.SENTRY_DSN,
        TIPIMAIL_API_KEY: process.env.TIPIMAIL_API_KEY,
        TIPIMAIL_API_USER: process.env.TIPIMAIL_API_USER,
      },
    },
  ],
};
