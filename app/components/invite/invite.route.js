const express = require('express');
const router = express.Router();
const inviteController = require('./invite.controller');
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");

router.post(
  '/send',
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => inviteController.sendInvites(req, res)
);

module.exports = router;
