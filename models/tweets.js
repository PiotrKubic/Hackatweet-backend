const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
    hashtag : { type: mongoose.Schema.Types.ObjectId, ref: 'hashtags' },
   });

const tweetSchema = mongoose.Schema({
	post: String,
    date: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    likes : Number,
    hashtag :  [hashtagSchema],
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;