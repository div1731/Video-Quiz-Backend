const { createValidationResponse } = require("../../utils/helpers/helpers");
const { isEmpty } = require("../../utils/validator");

class AnswerValidator {
  answer(req, res, next) {
    const errors = {};
    const { questionId, videoId } = req.body;

    if (isEmpty(questionId)) {
      errors.questionId = "QuestionId is required";
    }
    if (isEmpty(videoId)) {
      errors.videoId = "VideoId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  saveUserResponse(req, res, next) {
    const errors = {};
    const { questionId, videoId, answer } = req.body;

    if (isEmpty(questionId)) {
      errors.questionId = "QuestionId is required";
    }
    if (isEmpty(videoId)) {
      errors.videoId = "VideoId is required";
    }
    if (isEmpty(answer)) {
      errors.answer = "Answer is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }
}
const answerValidationObj = new AnswerValidator();
module.exports = answerValidationObj;
