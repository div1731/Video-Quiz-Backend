const Video = require('../models/video.model');

const createVideo = async (videoData) => {
  try {
    const video = new Video(videoData);
    await video.save();
    return video;
  } catch (error) {
    throw new Error(`Could not create video: ${error.message}`);
  }
};

const getVideoById = async (videoId, userId) => {
  try {
    const video = await Video.findOne({ _id: videoId, user: userId });
    if (!video) {
      throw new Error('Video not found or you do not have permission to view it.');
    }
    return video;
  } catch (error) {
    throw new Error(`Could not retrieve video: ${error.message}`);
  }
};

module.exports = {
  createVideo,
  getVideoById,
}; 