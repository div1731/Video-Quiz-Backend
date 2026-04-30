const Question = require("../models/question.model");
const UserAnswer = require("../models/userAnswer.model");

class QuestionService {
  async question(payload, user) {
    try {
      const { videoId, videoUrl, title, thumbnail, questions } = payload;
      const createdBy = user._id;
      
      let videoDocument = await Question.findOne({ videoId, createdBy });

      if (!videoDocument) {
        let finalTitle = title;
        let finalThumbnail = thumbnail;

        if (!finalTitle || !finalThumbnail) {
          const Video = require("../models/video.model");
          const videoMeta = await Video.findOne({ videoId });
          if (videoMeta) {
            finalTitle = finalTitle || videoMeta.title;
            finalThumbnail = finalThumbnail || videoMeta.thumbnail;
          }
        }

        videoDocument = new Question({
          videoId,
          createdBy,
          videoUrl,
          title: finalTitle,
          thumbnail: finalThumbnail,
          questions: questions || []
        });
      } else {
        if (videoUrl) videoDocument.videoUrl = videoUrl;
        if (title) videoDocument.title = title;
        if (thumbnail) videoDocument.thumbnail = thumbnail;
        
        if (!videoDocument.title || !videoDocument.thumbnail) {
          const Video = require("../models/video.model");
          const videoMeta = await Video.findOne({ videoId });
          if (videoMeta) {
            videoDocument.title = videoDocument.title || videoMeta.title;
            videoDocument.thumbnail = videoDocument.thumbnail || videoMeta.thumbnail;
          }
        }
      }

      if (!questions) {
        return videoDocument;
      }

      const incomingTimeSet = new Set();
      for (const q of questions) {
        if (incomingTimeSet.has(q.time)) {
          throw new Error(
            `Duplicate timestamp ${q.time} found in your request. Each question must have a unique timestamp.`,
          );
        }
        incomingTimeSet.add(q.time);
      }

      videoDocument.questions = questions;
      return await videoDocument.save();
    } catch (err) {
      throw err;
    }
  }

  async getVideos(user) {
    try {
      const { _id } = user;
      return await Question.aggregate([
        { $match: { createdBy: _id } },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "videoId",
            as: "videoMeta"
          }
        },
        {
          $unwind: {
            path: "$videoMeta",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "useranswers",
            let: { 
              vId: { $toString: "$_id" },
              qIds: { $map: { input: { $ifNull: ["$questions._id", []] }, as: "qid", in: { $toString: "$$qid" } } }
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$videoId", "$$vId"] },
                      { $in: [{ $toString: "$questionId" }, "$$qIds"] }
                    ]
                  }
                }
              }
            ],
            as: "userAnswers",
          },
        },
        {
          $project: {
            videoId: 1,
            videoUrl: 1,
            title: { 
              $cond: {
                if: { $or: [{ $eq: ["$title", null] }, { $eq: ["$title", ""] }] },
                then: { $ifNull: ["$videoMeta.title", "Untitled Video"] },
                else: "$title"
              }
            },
            thumbnail: { 
              $cond: {
                if: { $or: [{ $eq: ["$thumbnail", null] }, { $eq: ["$thumbnail", ""] }] },
                then: { $ifNull: ["$videoMeta.thumbnail", null] },
                else: "$thumbnail"
              }
            },
            questions: 1,
            userAnswers: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);
    } catch (err) {
      throw err;
    }
  }

  async getAllUserVideos(user) {
    try {
      const { _id } = user;
      const userAnswers = await UserAnswer.find({ userId: _id });
      const mongoose = require('mongoose');
      const questionIds = [...new Set(userAnswers.map(ua => ua.questionId.toString()))]
        .map(id => new mongoose.Types.ObjectId(id));
      
      return await Question.aggregate([
        { $match: { _id: { $in: questionIds } } },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "videoId",
            as: "videoMeta"
          }
        },
        {
          $unwind: {
            path: "$videoMeta",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "useranswers",
            localField: "_id",
            foreignField: "questionId",
            as: "userAnswers",
          },
        },
        {
          $addFields: {
            title: { 
              $cond: {
                if: { $or: [{ $eq: ["$title", null] }, { $eq: ["$title", ""] }] },
                then: { $ifNull: ["$videoMeta.title", "Untitled Video"] },
                else: "$title"
              }
            },
            thumbnail: { 
              $cond: {
                if: { $or: [{ $eq: ["$thumbnail", null] }, { $eq: ["$thumbnail", ""] }] },
                then: { $ifNull: ["$videoMeta.thumbnail", null] },
                else: "$thumbnail"
              }
            }
          }
        }
      ]);
    } catch (err) {
      throw err;
    }
  }

  async getVideoByUrl(payload, user) {
    try {
      const { videoId } = payload;
      return await Question.findOne({ videoId: videoId, createdBy: user._id });
    } catch (err) {
      throw err;
    }
  }

  async getVideoById(payload, user) {
    try {
      const { id } = payload;
      const video = await Question.findOne({ _id: id, createdBy: user._id }).lean();
      if (!video) return null;

      if (!video.title || !video.thumbnail) {
        const Video = require("../models/video.model");
        let videoMeta = await Video.findOne({ videoId: video.videoId });
        
        if (!videoMeta || !videoMeta.title || !videoMeta.thumbnail) {
          try {
            const ytdl = require("@distube/ytdl-core");
            const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.videoId}`);
            const metadata = {
              videoId: video.videoId,
              title: info.videoDetails.title,
              description: info.videoDetails.description,
              thumbnail: info.videoDetails.thumbnails[0].url,
            };
            
            videoMeta = await Video.findOneAndUpdate(
              { videoId: video.videoId },
              { $set: metadata },
              { upsert: true, new: true }
            );

            await Question.updateOne(
              { _id: video._id },
              { $set: { title: metadata.title, thumbnail: metadata.thumbnail } }
            );
            
            video.title = metadata.title;
            video.thumbnail = metadata.thumbnail;
          } catch (ytdlErr) {
          }
        }

        if (videoMeta) {
          video.title = video.title || videoMeta.title;
          video.thumbnail = video.thumbnail || videoMeta.thumbnail;
        }
      }
      return video;
    } catch (err) {
      throw err;
    }
  }

  async deleteQuestion(payload, user) {
    try {
      const { id } = payload;
      const deleteResult = await Question.deleteOne({
        _id: id,
        createdBy: user._id,
      });

      if (deleteResult.deletedCount > 0) {
        await UserAnswer.deleteMany({ questionId: id });
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }

  async getPublicVideo(payload) {
    try {
      const { videoId, shareId } = payload;
      let query = {};

      if (shareId) {
        query = { _id: shareId };
      } else if (videoId) {
        query = { videoId: videoId };
      } else {
        throw new Error("Either videoId or shareId is required");
      }

      const video = await Question.findOne(query).lean();
      if (!video) {
        return null;
      }

      if (!video.title || !video.thumbnail) {
        const Video = require("../models/video.model");
        let videoMeta = await Video.findOne({ videoId: video.videoId });
        
        if (!videoMeta || !videoMeta.title || !videoMeta.thumbnail) {
          try {
            const ytdl = require("@distube/ytdl-core");
            const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.videoId}`);
            const metadata = {
              videoId: video.videoId,
              title: info.videoDetails.title,
              description: info.videoDetails.description,
              thumbnail: info.videoDetails.thumbnails[0].url,
            };
            
            videoMeta = await Video.findOneAndUpdate(
              { videoId: video.videoId },
              { $set: metadata },
              { upsert: true, new: true }
            );

            await Question.updateOne(
              { _id: video._id },
              { $set: { title: metadata.title, thumbnail: metadata.thumbnail } }
            );
            
            video.title = metadata.title;
            video.thumbnail = metadata.thumbnail;
          } catch (ytdlErr) {
          }
        }

        if (videoMeta) {
          video.title = video.title || videoMeta.title;
          video.thumbnail = video.thumbnail || videoMeta.thumbnail;
        }
      }

      return video;
    } catch (err) {
      throw err;
    }
  }

  async generateShareLink(payload, user) {
    try {
      const { videoId } = payload;
      const video = await Question.findOne({
        videoId: videoId,
        createdBy: user._id,
      });

      if (!video) {
        throw new Error("Video not found");
      }

      return {
        shareId: video._id,
        shareUrl: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/preview/${video._id}`,
        videoId: video.videoId,
        videoUrl: video.videoUrl,
      };
    } catch (err) {
      throw err;
    }
  }

  async updateQuestionDetails({ videoId, questionId, title, options, answer }, user) {
    try {
      const video = await Question.findOne({ _id: videoId, createdBy: user._id });
      if (!video) throw new Error("Video not found or access denied");

      const questionIndex = video.questions.findIndex(q => q._id.toString() === questionId);
      if (questionIndex === -1) throw new Error("Question not found");

      if (title !== undefined) video.questions[questionIndex].title = title;
      if (options !== undefined) video.questions[questionIndex].options = options;
      if (answer !== undefined) video.questions[questionIndex].answer = answer;

      const updatedVideo = await video.save();
      return updatedVideo.questions[questionIndex];
    } catch (err) {
      throw err;
    }
  }

  async removeQuestion({ videoId, questionId }, user) {
    try {
      const video = await Question.findOne({ _id: videoId, createdBy: user._id });
      if (!video) throw new Error("Video not found or access denied");

      video.questions = video.questions.filter(q => q._id.toString() !== questionId);
      return await video.save();
    } catch (err) {
      throw err;
    }
  }

  async clearQuestionsAtTime({ videoId, time }, user) {
    try {
      const video = await Question.findOne({ _id: videoId, createdBy: user._id });
      if (!video) throw new Error("Video not found or access denied");

      video.questions = video.questions.filter(q => parseFloat(q.time) !== parseFloat(time));
      return await video.save();
    } catch (err) {
      throw err;
    }
  }
}

const questionService = new QuestionService();
module.exports = questionService;
