var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

const Tweet = require("../models/tweets");
const Hashtag = require("../models/hashtags");

router.get("/", async (req, res) => {
  const hashtags = await Hashtag.find();
  res.json({ hashtags });
});

module.exports = router;

router.post("/tweets", async (req, res) => {
  const hashtagId = req.body.id;
  const tweets = await Hashtag.find({ _id: hashtagId }).populate("tweetId");
  return res.json({ tweets });
});
