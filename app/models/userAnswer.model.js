const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
    videoId: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    answer: {
      type: Schema.Types.Mixed, // This allows both array and string/object
      default: []
    },
    username: {
      type: String,
    },
    userEmail: {
      type: String,
    },
  },
  {
    timestamps: true,
    usePushEach: true,
    collection: 'useranswers' // Explicitly specify collection name
  }
);

module.exports = mongoose.model("UserAnswer", schema);
