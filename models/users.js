const mongoose = require('mongoose');

const likedTweetsSchema = mongoose.Schema({
    likedTweets : { type: mongoose.Schema.Types.ObjectId, ref: 'tweets' },
   });

const userSchema = mongoose.Schema({
	pseudo: String,
    username: String,
    password: String,
    token : String,
    likedTweets : [likedTweetsSchema],
});

const User = mongoose.model('users', userSchema);

module.exports = User;