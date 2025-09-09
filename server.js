const express = require("express");
require("dotenv").config();
const path = require("path");
const http = require("http");
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const server = http.Server(app);
const routes = require("./app/routes")

// dotenv.config();
// Init Router
const favicon = require("express-favicon");
const chalk = require("chalk");
const middlewares = require("./app/middleware");

// Apply middlewares first
middlewares.init(app);

// Then register routes
routes(app);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: false,
    message: 'Internal server error',
    data: {}
  });
});

// Serve frontend build
const buildPath = path.join(__dirname, "../../", "build");
app.use(favicon(path.join(buildPath, "favicon.ico")));
app.use(express.static(buildPath));


// API Health check
app.all("/api/health-check", (req, res) => {
  return res.status(200).json({
    status: 200,
    message: `Working Fine - ENV: ${String(process.env.NODE_ENV)}`,
  });
});

// Catch-all for unknown API routes
app.all("/api/*name", (req, res) => {
  return res.status(400).json({ status: 400, message: "Bad Request" });
});

// Catch-all for client-side routing (React SPA)
app.all("*name", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
 
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain a minimum of 5 socket connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            retryWrites: true,
            retryReads: true,
        });
        
        // Disable mongoose buffering to prevent hanging queries
        mongoose.set('bufferCommands', false);
        console.log('MongoDB Connected Successfully...!');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Exit the process with failure
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

connectDB();

  server.listen(process.env.PORT, () => {
      console.log(
        "%s App is running at http://localhost:%d in %s mode",
        chalk.green("✓"),
        process.env.PORT,
        process.env.NODE_ENV
      );
      console.log("  Press CTRL-C to stop\n");
    });
