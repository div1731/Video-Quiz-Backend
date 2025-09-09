const Answer = require("../models/userAnswer.model");
const mongoose = require('mongoose');

class AnswerService {
  async answer(payload, user) {
    try {
      const qid = payload.answer.map((i) => {
        return i.qId;
      });

      const answer = await Answer.findOne({
        userId: user._id,
        questionId: payload.questionId,
        "answer.qId": { $in: qid },
      });

      if (answer) {
        throw Error("already answered");
      }

      const data = await Answer.findOne({
        userId: user._id,
        questionId: payload.questionId,
      });

      if (!data) {
        const answer = new Answer({
          ...payload,
          userId: user._id,
          username: user.username,
          userEmail: user.email,
        });
        const result = await answer.save();
        return result;
      } else {
        await Answer.updateOne(
          { userId: user._id, questionId: payload.questionId },
          { $push: { answer: payload.answer } }
        );
        const data = await Answer.findOne({
          userId: user._id,
          questionId: payload.questionId,
        });
        return data;
      }
    } catch (err) {
      throw err;
    }
  }
  async saveUserResponse(payload, user) {
    try {
      // console.log('=== SAVE USER RESPONSE START ===');
      // console.log('Payload received:', JSON.stringify(payload, null, 2));
      // console.log('User received:', { id: user._id, username: user.username, email: user.email });
      
      const { questionId, videoId, answer } = payload;
      
      // Check database connection
      console.log('MongoDB connection state:', mongoose.connection.readyState);
      console.log('Database name:', mongoose.connection.db?.databaseName);
      console.log('Model collection name:', Answer.collection.name);
      
      if (!questionId || !videoId || !answer) {
        const error = new Error('Missing required fields: questionId, videoId, and answer are required.');
        error.statusCode = 400;
        throw error;
      }

      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        const error = new Error('Invalid questionId format.');
        error.statusCode = 400;
        throw error;
      }

      const query = { userId: user._id, questionId, videoId };
      console.log('Query to find existing record:', JSON.stringify(query, null, 2));
      
      // Check if record exists first
      const existingRecord = await Answer.findOne(query);
      console.log('Existing record found:', existingRecord ? 'YES' : 'NO');
      if (existingRecord) {
        console.log('Existing record details:', JSON.stringify(existingRecord, null, 2));
      }
      
      const update = {
        $set: {
          answer: answer,
          username: user.username,
          userEmail: user.email,
          updatedAt: new Date()
        }
      };
      console.log('Update object:', JSON.stringify(update, null, 2));
      
      const options = {
        new: true,          // Return the modified document
        upsert: true,       // Create a new document if one doesn't exist
        runValidators: true,
        setDefaultsOnInsert: true
      };
      console.log('Options:', JSON.stringify(options, null, 2));

      console.log('Executing findOneAndUpdate on collection:', Answer.collection.name);
      const result = await Answer.findOneAndUpdate(query, update, options);
      
      console.log('=== SAVE OPERATION COMPLETED ===');
      console.log('Result from database:', JSON.stringify(result, null, 2));
      console.log('Document ID:', result._id);
      console.log('Saved to collection:', Answer.collection.name);
      
      // Verify the save by querying the database
      console.log('=== VERIFICATION QUERY ===');
      const verification = await Answer.findById(result._id);
      console.log('Verification query result:', verification ? 'FOUND' : 'NOT FOUND');
      if (verification) {
        console.log('Verified document in collection:', Answer.collection.name);
        console.log('Verified document:', JSON.stringify(verification, null, 2));
      }
      
      // Count total documents in collection
      const totalCount = await Answer.countDocuments();
      console.log('Total documents in', Answer.collection.name, 'collection:', totalCount);
      
      console.log('=== SAVE USER RESPONSE END ===');
      return result;
    } catch (error) {
      console.error('=== ERROR IN SAVE USER RESPONSE ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}

const answerService = new AnswerService();
module.exports = answerService;