const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  post: String,
  date: {
    type: Date,
    default: Date.now(),
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  likes: {
    type: Number,
    default: 0,
  },
  hashtag: [{ type: mongoose.Schema.Types.ObjectId, ref: "hashtags" }],
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
