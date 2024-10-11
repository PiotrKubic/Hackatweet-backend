var express = require("express");
var router = express.Router();

const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  User.find().then((data) => res.json(data));
});

router.post("/signup", (req, res) => {
  User.findOne({
    username: { $regex: new RegExp(req.body.username, "i") },
  }).then((data) => {
    if (data === null) {
      const newUser = new User({
        pseudo: req.body.pseudo,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        token: uid2(32),
        likedTweets: [],
      });
      newUser.save().then((user) => {
        res.json({ result: true, user });
      });
    } else {
      res.json({ result: false, error: "Username already used betch" });
    }
  });
});

router.post("/signin", (req, res) => {
  /* if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  } 
*/
  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// router.get("/getId/:id", async (req, res) => {
//   console.log(req.params.id);
//   const id = req.params.id;
//   const userData = await User.findOne({ _id: id });
//   return res.json({ userData });
// });

module.exports = router;
