const ytdl = require("@distube/ytdl-core");
const Video = require("../../models/video.model");
const Question = require("../../models/question.model");

exports.saveYouTubeVideo = async (req, res) => {
  try {
    const { videoUrl, title, description, thumbnail } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ status: false, message: "videoUrl is required" });
    }

    let metadata;

    if (title && description && thumbnail) {
      metadata = {
        videoId: req.body.videoId || videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop(),
        title,
        description,
        thumbnail,
        uploadedBy: req.user._id,
        userEmail: req.user.email,
        username: req.user.username,
      };
    } else {
      const info = await ytdl.getInfo(videoUrl);
      metadata = {
        videoId: info.videoDetails.videoId,
        title: info.videoDetails.title,
        description: info.videoDetails.description,
        thumbnail: info.videoDetails.thumbnails[0].url,
        uploadedBy: req.user._id,
        userEmail: req.user.email,
        username: req.user.username,
      };
    }

    const videoDoc = await Video.findOneAndUpdate(
      { videoId: metadata.videoId },
      { $set: metadata },
      { upsert: true, new: true }
    );
    res.json({ status: true, data: videoDoc });
  } catch (e) {
    res.status(400).json({ status: false, message: e.message });
  }
};

exports.deleteQuestionAndVideo = async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    await Question.deleteMany({ _id:questionId });
    await Video.deleteOne({ videoId: question.videoId });
    res.json({
      status: true,
      message: "Question and video metadata deleted successfully",
      data: true
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error deleting question and video metadata",
      error: err.message
    });
  }
};

exports.getVideoByIdAndMeta = async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    const videoMeta = await Video.findOne({ videoId: question.videoId });
    if (!videoMeta) {
      return res.status(404).json({
        status: false,
        message: "Video not found",
      });
    }

    res.json({
      status: true,
      data: {
        videoId: question.videoId,
        questions: question.questions,
        meta: videoMeta
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching video data",
      error: err.message
    });
  }
};
