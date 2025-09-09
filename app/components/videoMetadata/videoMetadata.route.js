const express = require("express");
const router = express.Router();
const passport = require("passport");
const videoController = require("./videoMetadata.controller");

// Save YouTube video
router.post(
  "/save",
  passport.authenticate("jwt", { session: false }),
  videoController.saveYouTubeVideo
);

// Delete both video and questions
router.delete(
  "/deleteBoth/:id",
  passport.authenticate("jwt", { session: false }),
  videoController.deleteQuestionAndVideo
);

router.get(
  "/both/:id",
  passport.authenticate("jwt", { session: false }),
  videoController.getVideoByIdAndMeta
);

module.exports = router;