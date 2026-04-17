const { createError, createResponse } = require('../../utils/helpers/helpers');
const questionServices = require('../../services/questionServices');
const userAnswerServices = require('../../services/userAnswerServices');

class QuestionController {
  async question(req, res) {
    try {
      const { body, user } = req;
      
      if (!body.videoUrl || !body.videoId) {
        return createError(res, {}, { message: 'videoUrl and videoId are required' });
      }
      
      if (!Array.isArray(body.questions)) {
        return createError(res, {}, { message: "'questions' must be an array" });
      }
      
      const invalidIndex = body.questions.findIndex((q) => !q || typeof q.time === 'undefined');
      if (invalidIndex !== -1) {
        return createError(res, {}, { message: `Invalid questions data. 'questions[${invalidIndex}].time' is required` });
      }
      
      const timeValidationIndex = body.questions.findIndex((q) => {
        const time = parseFloat(q.time);
        return isNaN(time) || time < 0;
      });
      if (timeValidationIndex !== -1) {
        return createError(res, {}, { message: `Invalid time value at questions[${timeValidationIndex}]. Time must be a positive number.` });
      }
      
      const data = await questionServices.question(body, user);
      if (data) {
        createResponse(res, true, 'Question added successfully', { data });
      } else {
        createError(res, {}, { message: 'Failed to add question. Please try again' });
      }
    } catch (e) {
      console.error('Error in question controller:', e.message);
      createError(res, e);
    }
  }

  async getVideos(req, res) {
    try {
      const { user } = req;
      const data = await questionServices.getVideos(user);
      if (data) {
        createResponse(res, true, 'Videos retrieved successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to retrieve videos. Please try again' });
      }
    } catch (e) {
      console.error('Error in getVideos:', e.message);
      createError(res, e);
    }
  }

  async getVideoByUrl(req, res) {
    try {
      const { query, user } = req;
      if (!query.url) {
        return createError(res, {}, { message: "'url' query parameter is required" });
      }
      const data = await questionServices.getVideoByUrl(query, user);
      if (data) {
        createResponse(res, true, 'Video retrieved successfully', data);
      } else {
        createError(res, {}, { message: 'Video not found' });
      }
    } catch (e) {
      console.error('Error in getVideoByUrl:', e.message);
      createError(res, e);
    }
  }

  async getVideoById(req, res) {
    try {
      const { query, user } = req;
      if (!query.id) {
        return createError(res, {}, { message: "'id' query parameter is required" });
      }
      const data = await questionServices.getVideoById({ id: query.id }, user);
      if (data) {
        createResponse(res, true, 'Video retrieved successfully', data);
      } else {
        createError(res, {}, { message: 'Video not found' });
      }
    } catch (e) {
      console.error('Error in getVideoById:', e.message);
      createError(res, e);
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { params, user } = req;
      if (!params.id) {
        return createError(res, {}, { message: "'id' parameter is required" });
      }
      const data = await questionServices.deleteQuestion(params, user);
      if (data) {
        createResponse(res, true, 'Question deleted successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to delete question. Please try again' });
      }
    } catch (e) {
      console.error('Error in deleteQuestion:', e.message);
      createError(res, e);
    }
  }

  async getPublicVideo(req, res) {
    try {
      const { query } = req;
      const { videoId, shareId } = query;
      
      if (!videoId && !shareId) {
        return createError(res, {}, { message: 'Either videoId or shareId is required' });
      }
      
      const data = await questionServices.getPublicVideo({ videoId, shareId });
      if (data) {
        createResponse(res, true, 'Video retrieved successfully', data);
      } else {
        createError(res, {}, { message: 'Video not found' });
      }
    } catch (e) {
      console.error('Error in getPublicVideo:', e.message);
      createError(res, e);
    }
  }

  async generateShareLink(req, res) {
    try {
      const { body, user } = req;
      if (!body.videoId) {
        return createError(res, {}, { message: 'videoId is required' });
      }
      
      const data = await questionServices.generateShareLink(body, user);
      if (data) {
        createResponse(res, true, 'Share link generated successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to generate share link. Please try again' });
      }
    } catch (e) {
      console.error('Error in generateShareLink:', e.message);
      createError(res, e);
    }
  }

  async updateUserAnswer(req, res) {
    try {
      const { id: questionId, answer, videoId } = req.body;
      const { user } = req;
      
      if (!questionId || !videoId || !answer) {
        return createError(res, {}, { message: 'id, videoId, and answer are required' });
      }
      
      const data = await userAnswerServices.saveUserResponse({ questionId, videoId, answer }, user);
      if (data) {
        createResponse(res, true, 'Answer saved successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to save answer. Please try again.' });
      }
    } catch (e) {
      console.error('Error in updateUserAnswer:', e.message);
      if (e.message && (e.message.includes('ValidationError') || e.message.includes('CastError') || e.message.includes('Invalid question ID format'))) {
        createError(res, {}, { message: 'Invalid data or ID format provided' });
      } else {
        createError(res, e);
      }
    }
  }

  async removeQuestion(req, res) {
    try {
      const { videoId, questionId } = req.body;
      const { user } = req;
      
      if (!videoId || !questionId) {
        return createError(res, {}, { message: 'videoId and questionId are required' });
      }
      
      const data = await questionServices.removeQuestion({ videoId, questionId }, user);
      if (data) {
        createResponse(res, true, 'Question removed successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to remove question. Please try again.' });
      }
    } catch (e) {
      console.error('Error in removeQuestion:', e.message);
      createError(res, e);
    }
  }

  async clearQuestionsAtTime(req, res) {
    try {
      const { videoId, time } = req.body;
      const { user } = req;
      
      if (!videoId || typeof time === 'undefined') {
        return createError(res, {}, { message: 'videoId and time are required' });
      }
      
      const data = await questionServices.clearQuestionsAtTime({ videoId, time }, user);
      if (data) {
        createResponse(res, true, 'Questions cleared successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to clear questions. Please try again.' });
      }
    } catch (e) {
      console.error('Error in clearQuestionsAtTime:', e.message);
      createError(res, e);
    }
  }

  async updateQuestionDetails(req, res) {
    try {
      const { videoId, questionId, title, options, answer } = req.body;
      const { user } = req;
      
      if (!videoId || !questionId) {
        return createError(res, {}, { message: 'videoId and questionId are required' });
      }
      
      const data = await questionServices.updateQuestionDetails({ videoId, questionId, title, options, answer }, user);
      if (data) {
        createResponse(res, true, 'Question details updated successfully', data);
      } else {
        createError(res, {}, { message: 'Failed to update question details' });
      }
    } catch (e) {
      console.error('Error in updateQuestionDetails:', e.message);
      createError(res, e);
    }
  }

  async debugVideoQuestions(req, res) {
    try {
      const { query, user } = req;
      if (!query.videoId) {
        return createError(res, {}, { message: "'videoId' query parameter is required" });
      }
      
      const data = await questionServices.getVideoByUrl({ videoId: query.videoId }, user);
      if (data) {
        createResponse(res, true, 'Video questions retrieved for debugging', {
          videoId: data.videoId,
          videoUrl: data.videoUrl,
          totalQuestions: data.questions.length,
          questions: data.questions.map(q => ({
            _id: q._id,
            time: q.time,
            title: q.title,
            type: q.type,
            options: q.options
          }))
        });
      } else {
        createResponse(res, true, 'No video found with this ID', { videoId: query.videoId });
      }
    } catch (e) {
      console.error('Error in debugVideoQuestions:', e.message);
      createError(res, e);
    }
  }
}

const questionController = new QuestionController();
module.exports = questionController;