const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  description: String,
  thumbnail: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userEmail: String,
  username: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Video", VideoSchema);