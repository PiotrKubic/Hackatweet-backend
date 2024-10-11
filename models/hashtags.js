const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
    tweetId: [{ type: mongoose.Schema.Types.ObjectId, ref: "tweets" }],
    hashtag: { type: String, unique: true, required: true }
   });


const Hashtag = mongoose.model('hashtags', hashtagSchema);

module.exports = Hashtag;