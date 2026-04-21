const express = require("express");
const router = express.Router();
const feedbackController = require("./feedback.controller");
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");

router.post(
  "/submit",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => feedbackController.createFeedback(req, res)
);

module.exports = router;
