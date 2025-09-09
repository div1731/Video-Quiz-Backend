const Question = require("../models/question.model");
const UserAnswer = require("../models/userAnswer.model");

class QuestionService {
  async question(payload, user) {
    try {
      const { videoId, videoUrl, questions } = payload;
      const createdBy = user._id;
      let videoDocument = await Question.findOneAndUpdate(
        { videoId, createdBy },
        {
          $setOnInsert: { videoId, videoUrl, createdBy, questions: [] },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      if (!questions) {
        return videoDocument;
      }
      

      const incomingTimeSet = new Set();
      for (const q of questions) {
        if (incomingTimeSet.has(q.time)) {
          throw new Error(
            `Duplicate timestamp ${q.time} found in your request. Each question must have a unique timestamp.`
          );
        }
        incomingTimeSet.add(q.time);
      }

      videoDocument.questions = questions;
      return await videoDocument.save();
    } catch (err) {
      throw err;
    }
  }

  async getVideos(user) {
    try {
      const { _id } = user;
      return await Question.aggregate([
        { $match: { createdBy: _id } },
        {
          $lookup: {
            from: "useranswers",
            localField: "_id",
            foreignField: "questionId",
            as: "userAnswers",
          },
        },
      ]);
    } catch (err) {
      throw err;
    }
  }

  async getVideoByUrl(payload, user) {
    try {
      const { videoId } = payload;
      return await Question.findOne({ videoId: videoId, createdBy: user._id });
    } catch (err) {
      throw err;
    }
  }

  async getVideoById(payload, user) {
    try {
      const { id } = payload;
      return await Question.findOne({ _id: id, createdBy: user._id });
    } catch (err) {
      throw err;
    }
  }

  async deleteQuestion(payload, user) {
    try {
      const { id } = payload;
      const deleteResult = await Question.deleteOne({
        _id: id,
        createdBy: user._id,
      });

      if (deleteResult.deletedCount > 0) {
        await UserAnswer.deleteMany({ questionId: id });
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }

  async getPublicVideo(payload) {
    try {
      const { videoId, shareId } = payload;
      let query = {};

      if (shareId) {
        query = { _id: shareId };
      } else if (videoId) {
        query = { videoId: videoId };
      } else {
        throw new Error("Either videoId or shareId is required");
      }

      const video = await Question.findOne(query);
      if (!video) {
        return null;
      }

      return {
        _id: video._id,
        videoId: video.videoId,
        videoUrl: video.videoUrl,
        questions: video.questions,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      };
    } catch (err) {
      throw err;
    }
  }

  async generateShareLink(payload, user) {
    try {
      const { videoId } = payload;
      const video = await Question.findOne({
        videoId: videoId,
        createdBy: user._id,
      });

      if (!video) {
        throw new Error("Video not found");
      }

      return {
        shareId: video._id,
        shareUrl: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/preview/${video._id}`,
        videoId: video.videoId,
        videoUrl: video.videoUrl,
      };
    } catch (err) {
      throw err;
    }
  }

  async upsertAnswer({ questionId, videoId, answer }) {
    try {
      const questionDoc = await Question.findById(videoId);

      if (!questionDoc) {
        throw new Error("Video not found");
      }

      const questionIndex = questionDoc.questions.findIndex(
        (q) => q._id.toString() === questionId
      );

      if (questionIndex === -1) {
        throw new Error("Question not found within the video");
      }

      questionDoc.questions[questionIndex].answer = answer[0].answer;
      await questionDoc.save();
      return questionDoc.questions[questionIndex];
    } catch (err) {
      throw err;
    }
  }
}

const questionService = new QuestionService();
module.exports = questionService;