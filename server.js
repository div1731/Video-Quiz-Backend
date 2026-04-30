const express = require("express");
require("dotenv").config();
const path = require("path");
const http = require("http");
const app = express();
const mongoose = require('mongoose');
const server = http.Server(app);
const routes = require("./app/routes")

const favicon = require("express-favicon");
const middlewares = require("./app/middleware");

middlewares.init(app);

routes(app);

app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: 'Internal server error',
    data: {}
  });
});

const buildPath = path.join(__dirname, "../../", "build");
app.use(favicon(path.join(buildPath, "favicon.ico")));
app.use(express.static(buildPath));


app.all("/api/health-check", (req, res) => {
  return res.status(200).json({
    status: 200,
    message: `Working Fine - ENV: ${String(process.env.NODE_ENV)}`,
  });
});

app.all("/api/*name", (req, res) => {
  return res.status(400).json({ status: 400, message: "Bad Request" });
});

app.all("*name", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
 
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            retryReads: true,
        });
        
        mongoose.set('bufferCommands', false);
    } catch (err) {
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

connectDB();

server.listen(process.env.PORT);
