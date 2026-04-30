const path = require("path");
const dotenv = require("dotenv");


const envPostFix = process.env.APP_ENV ? `.${process.env.APP_ENV}` : "";
dotenv.config({
  path: path.resolve(__dirname, `../../.env${envPostFix}`),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  ENV: process.env.APP_ENV,
  APP_BASE_URL: process.env.APP_BASE_URL,
  PORT: process.env.PORT,
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  EXPRESS_SECRET: process.env.EXPRESS_SECRET || "default-jwt-secret",
  SEGMENT_KEY: process.env.SEGMENT_KEY,
  MAX_RESPONSE_TIME: process.env.MAX_RESPONSE_TIME || 10000,
  SENTRY_KEY: process.env.SENTRY_KEY,
};
