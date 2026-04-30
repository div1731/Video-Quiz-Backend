const Answer = require("../models/userAnswer.model");
const mongoose = require('mongoose');

class AnswerService {
  async answer(payload, user) {
    try {
      const qid = payload.answer.map((i) => {
        return i.qId;
      });

      const answer = await Answer.findOne({
        userId: user._id,
        questionId: payload.questionId,
        "answer.qId": { $in: qid },
      });

      if (answer) {
        throw Error("already answered");
      }

      const data = await Answer.findOne({
        userId: user._id,
        questionId: payload.questionId,
      });

      if (!data) {
        const answer = new Answer({
          ...payload,
          userId: user._id,
          username: user.username,
          userEmail: user.email,
        });
        const result = await answer.save();
        return result;
      } else {
        await Answer.updateOne(
          { userId: user._id, questionId: payload.questionId },
          { $push: { answer: payload.answer } }
        );
        const data = await Answer.findOne({
          userId: user._id,
          questionId: payload.questionId,
        });
        return data;
      }
    } catch (err) {
      throw err;
    }
  }
  async saveUserResponse(payload, user) {
    try {
      
      const { questionId, videoId, answer } = payload;
      
      
      if (!questionId || !videoId || !answer) {
        const error = new Error('Missing required fields: questionId, videoId, and answer are required.');
        error.statusCode = 400;
        throw error;
      }

      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        const error = new Error('Invalid questionId format.');
        error.statusCode = 400;
        throw error;
      }

      const query = { userId: user._id, questionId, videoId };
      const update = {
        $set: {
          answer: answer,
          username: user.username,
          userEmail: user.email,
          updatedAt: new Date()
        }
      };
      
      const options = {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      };

      const result = await Answer.findOneAndUpdate(query, update, options);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

const answerService = new AnswerService();
module.exports = answerService;
