const express = require("express");
const router = express.Router();
const passport = require("passport");
const videoController = require("./videoMetadata.controller");

router.post(
  "/save",
  passport.authenticate("jwt", { session: false }),
  videoController.saveYouTubeVideo
);

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