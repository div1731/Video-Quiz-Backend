const auth = require('../components/auth/auth.route');
const question = require('../components/question/question.route');
const userAnswer = require('../components/userAnswer/userAnswer.route');
const videoMetadata = require('../components/videoMetadata/videoMetadata.route');
const feedback = require('../components/feedback/feedback.route');
const invite = require('../components/invite/invite.route');

module.exports = (app) => {
  app.use('/api/auth', auth);
  app.use('/api/question', question);
  app.use('/api/answer', userAnswer);
  app.use('/api/video', videoMetadata);
  app.use('/api/feedback', feedback);
  app.use('/api/invite', invite);
};