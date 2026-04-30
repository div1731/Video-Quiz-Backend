const Answer = require("../../models/userAnswer.model");
const { createError, createResponse } = require("../../utils/helpers/helpers");
const userAnswerServices = require("../../services/userAnswerServices");

class AnswerController {
  async answer(req, res) {
    try {
      const data = await userAnswerServices.answer(req.body, req.user);
      if (data) {
        createResponse(res, true, "Answer add successful", data);
      } else {
        createError(
          res,
          {},
          { message: "Unable to answer add, please try again" }
        );
      }
    } catch (e) {
      createError(res, e);
    }
  }

  async saveUserResponse(req, res) {
    try {
      const data = await userAnswerServices.saveUserResponse(req.body, req.user);
      if (data) {
        createResponse(res, true, "User response saved successfully", data);
      } else {
        createError(
          res,
          {},
          { message: "Unable to save user response, please try again" }
        );
      }
    } catch (e) {
      createError(res, e);
    }
  }

  async checkAnswer(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      
      const Answer = require("../../models/userAnswer.model");
      
      let answer = await Answer.findOne({ _id: id, userId: user._id });
      
      if (!answer) {
        answer = await Answer.findOne({ videoId: id, userId: user._id });
      }
      
      if (!answer) {
        answer = await Answer.findOne({ questionId: id, userId: user._id });
      }
      
      if (answer) {
        createResponse(res, true, "Answer found", answer);
      } else {
        createError(res, {}, { message: "Answer not found" });
      }
    } catch (e) {
      createError(res, e);
    }
  }

  async getUserAnswers(req, res) {
    try {
      const { user } = req;
      const { videoId } = req.query;
      
      const query = { userId: user._id };
      if (videoId) {
        query.videoId = videoId;
      }
      
      const answers = await Answer.find(query)
        .populate('questionId', 'title question')
        .sort({ createdAt: -1 });
      
      createResponse(res, true, "User answers retrieved successfully", {
        count: answers.length,
        answers: answers
      });
    } catch (e) {
      createError(res, e);
    }
  }

  async deleteAnswer(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      
      const Answer = require("../../models/userAnswer.model");
      
      let deletedAnswer = await Answer.findOneAndDelete({ 
        _id: id, 
        userId: user._id 
      });
      
      if (!deletedAnswer) {
        deletedAnswer = await Answer.findOneAndDelete({ 
          videoId: id, 
          userId: user._id 
        });
      }
      
      if (deletedAnswer) {
        createResponse(res, true, "Answer deleted successfully", deletedAnswer);
      } else {
        createError(
          res, 
          {}, 
          { message: "Answer not found or you don't have permission to delete it." }
        );
      }
    } catch (e) {
      createError(res, e);
    }
  }

  async getAnswersByVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { user } = req;
      
      
      const answers = await Answer.find({ 
        videoId: videoId, 
        userId: user._id 
      }).populate('questionId', 'title question');
      
      createResponse(res, true, "Video answers retrieved successfully", {
        videoId: videoId,
        count: answers.length,
        answers: answers
      });
    } catch (e) {
      createError(res, e);
    }
  }
}

const answerController = new AnswerController();
module.exports = answerController;