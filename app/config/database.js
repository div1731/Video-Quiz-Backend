require("dotenv").config();
/* eslint-disable no-console */

/**
 * Configuration for the database
 */

const mongoose = require("mongoose");
// Remove the warning with Promise
mongoose.Promise = global.Promise;

// If debug run the mongoose debug options
mongoose.set("debug", process.env.MONGOOSE_DEBUG);

const connect = async (url) =>
  await mongoose.connect(url, {
    
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    //useCreateIndex: true,
  }
).then(() => {
    console.log("MongoDB connected successfully");
  }).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process with failure
  });

module.exports = connect;