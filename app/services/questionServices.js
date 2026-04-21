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
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      if (!questions) {
        return videoDocument;
      }

      const incomingTimeSet = new Set();
      for (const q of questions) {
        if (incomingTimeSet.has(q.time)) {
          throw new Error(
            `Duplicate timestamp ${q.time} found in your request. Each question must have a unique timestamp.`,
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

  async getAllUserVideos(user) {
    try {
      // Fetch videos that the logged-in user has participated in (answered questions for)
      const { _id } = user;
      
      // 1. Find all user answers for this user
      const userAnswers = await UserAnswer.find({ userId: _id });
      
      // 2. Extract unique question IDs
      const mongoose = require('mongoose');
      const questionIds = [...new Set(userAnswers.map(ua => ua.questionId.toString()))]
        .map(id => new mongoose.Types.ObjectId(id));
      
      // 3. Find the videos corresponding to those IDs
      return await Question.aggregate([
        { $match: { _id: { $in: questionIds } } },
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
  async updateQuestionDetails({ videoId, questionId, title, options, answer }, user) {
    console.log('[DEBUG] updateQuestionDetails called with:', { videoId, questionId, title, options, answer });
    try {
      // Find the video document belonging to the user
      const video = await Question.findOne({ _id: videoId, createdBy: user._id });
      console.log('[DEBUG] Video lookup result:', video ? 'Found' : 'NOT FOUND');

      if (!video) {
        console.error('[DEBUG] Video not found or access denied for ID:', videoId);
        throw new Error("Video not found or access denied");
      }

      const questionIndex = video.questions.findIndex(q => q._id.toString() === questionId);
      console.log('[DEBUG] Question index in array:', questionIndex);

      if (questionIndex === -1) {
        console.error('[DEBUG] Question ID not found in video questions array:', questionId);
        throw new Error("Question not found");
      }

      console.log('[DEBUG] Updating question details at index:', questionIndex);
      if (title !== undefined) video.questions[questionIndex].title = title;
      if (options !== undefined) video.questions[questionIndex].options = options;
      if (answer !== undefined) video.questions[questionIndex].answer = answer;

      const updatedVideo = await video.save();
      console.log('[DEBUG] Video saved successfully.');
      return updatedVideo.questions[questionIndex];
    } catch (err) {
      console.error('[DEBUG] Error in updateQuestionDetails service:', err.message);
      throw err;
    }
  }
}

const questionService = new QuestionService();
module.exports = questionService;
