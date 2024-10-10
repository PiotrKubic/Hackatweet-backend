const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
    hashtag : String,
   });


const Hashtag = mongoose.model('hashtags', hashtagSchema);

module.exports = Hashtag;