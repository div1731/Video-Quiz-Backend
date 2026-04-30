const express = require("express");
const router = express.Router();
const questionValidation = require("./question.validation");
const questionController = require("./question.controller");
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");

router.post(
  "/create",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => questionController.question(req, res)
);

router.get(
  "/getVideos",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    questionController.getVideos(req, res);
  }
);

router.get(
  "/all",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    questionController.getAllUserVideos(req, res);
  }
);

router.get(
  "/getVideoByUrl",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    questionController.getVideoByUrl(req, res);
  }
);

router.get(
  "/getVideoById",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => questionController.getVideoById(req, res)
);

router.delete(
  "/delete/:id",
  questionValidation.deleteQuestion,
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    questionController.deleteQuestion(req, res);
  }
);

router.get(
  "/public",
  (req, res) => questionController.getPublicVideo(req, res)
);

router.post(
  "/share",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => questionController.generateShareLink(req, res)
);

router.put(
  "/updateUserAnswer",
  questionValidation.updateUserAnswer,
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => questionController.updateUserAnswer(req, res)
);

router.put(
  "/updateDetails",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => questionController.updateQuestionDetails(req, res)
);

module.exports = router;
