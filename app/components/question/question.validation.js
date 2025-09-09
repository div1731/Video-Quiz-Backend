const { createValidationResponse } = require("../../utils/helpers/helpers");
const { isEmpty } = require("../../utils/validator");

class QuestionValidator {
  question(req, res, next) {
    const errors = {};
    const { videoId } = req.body;

    if (isEmpty(videoId)) {
      errors.videoId = "VideoId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }
  
  deleteQuestion(req, res, next) {
    const errors = {};
    const { id } = req.params;

    if (isEmpty(id)) {
      errors.id = "questionId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  updateUserAnswer(req, res, next) {
    const errors = {};
    const { id, answer, videoId } = req.body;
    if (!id) {
      errors.id = "id is required";
    }
    if (!videoId) {
      errors.videoId = "videoId is required";
    }
    if (!Array.isArray(answer) || answer.length === 0) {
      errors.answer = "answer must be a non-empty array";
    } else {
      answer.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          errors[`answer[${index}]`] = "Each answer item must be an object";
        } else {
          if (!item.qId) {
            errors[`answer[${index}].qId`] = "qId is required for each answer item";
          }
          if (typeof item.answer === "undefined") {
            errors[`answer[${index}].answer`] = "answer field is required for each answer item";
          }
        }
      });
    }
    if (Object.keys(errors).length > 0) {
      return createValidationResponse(res, errors);
    }
    next();
  }
}

const questionValidationObj = new QuestionValidator();
module.exports = questionValidationObj;