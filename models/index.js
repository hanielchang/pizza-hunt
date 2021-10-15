// When we add new models, MongoDB doesn't require us to restart
// and recreate the database. SQL does, however.

const Pizza = require('./Pizza');
const Comment = require('./Comment');

module.exports = { Pizza, Comment };