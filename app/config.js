var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO || 'mongodb://MongoLab-i:cVh9wgoCunTD9vdx1ViKiduRv2V2b3RrcukZeXsv.sY-@ds050077.mongolab.com:50077/MongoLab-i/test');

module.exports = mongoose;
