const auth = require('./app/components/auth/auth.route');
const question = require('./app/components/question/question.route');
const userAnswer = require('./app/components/userAnswer/userAnswer.route');
const video = require('./app/components/videoMetadata/videoMetadata.route');

module.exports = (app) => {
  app.use('/api/auth', auth);
  app.use('/api/question', question);
  app.use('/api/answer', userAnswer);
  app.use('/api/video', video);
};
