var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO || 'mongodb://localhost/test');

module.exports = mongoose;
