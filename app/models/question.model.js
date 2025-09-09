const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videoId: {
      type: String,
    },
    questions: [
      {
        type: {
          type: String,
        },
        time: {
          type: String,
        },
        title: {
          type: String,
        },
        options: [{ type: String }],
        answer: {
          type: String,
        },
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
        }
      },
    ],
  },
  { timestamps: true, usePushEach: true } // UTC format
);

module.exports = mongoose.model("Question", schema);
