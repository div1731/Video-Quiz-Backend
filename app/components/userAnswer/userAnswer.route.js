const express = require("express");
const router = express.Router();
const answerValidation = require("./userAnswer.validation");
const answerController = require("./userAnswer.controller");
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");

router.post(
  "/create",
  answerValidation.answer,
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    answerController.answer(req, res);
  }
);

router.get(
  "/check/:id",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => answerController.checkAnswer(req, res)
);

router.get(
  "/my-answers",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => answerController.getUserAnswers(req, res)
);

router.post(
  "/saveUserResponse",
  answerValidation.saveUserResponse,
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    answerController.saveUserResponse(req, res);
  }
);

module.exports = router;
