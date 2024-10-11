const mongoose = require('mongoose');



const tweetSchema = mongoose.Schema({
	post: String,
    date: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    likes : Number,
    hashtag : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hashtag' }],
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;