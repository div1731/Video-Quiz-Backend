require("dotenv").config();

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.set("debug", process.env.MONGOOSE_DEBUG);

const connect = async (url) => {
  try {
    await mongoose.connect(url, {});
  } catch {
    process.exit(1);
  }
};

module.exports = connect;
