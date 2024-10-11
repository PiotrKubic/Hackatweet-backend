var express = require("express");
var router = express.Router();

const Tweet = require("../models/tweets");
const User = require("../models/users");
const Hashtag = require("../models/hashtags");

router.get("/", (req, res) => {
  Tweet.find()
    .populate("user")
    .then((data) => res.json(data));
});

router.get("/tag", (req, res) => {
  Hashtag.find().then((data) => res.json(data));
});

// router.like("/like", async (req, rest) => {});

router.post("/post", (req, res) => {
  const regex = /#\w+/g;

  // Récupérer les hashtags dans le post
  let tagtag = req.body.post.match(regex);

  // Si des hashtags sont présents
  if (tagtag) {
    // Rechercher les hashtags existants dans la base de données
    Hashtag.find({ hashtag: tagtag })
      .then((dataHashtags) => {
        // Extraire les noms des hashtags existants
        const hashtagsNames = dataHashtags.map((h) => h.hashtag);

        // Identifier les nouveaux hashtags qui ne sont pas encore dans la base
        const newHashtags = tagtag.filter((e) => !hashtagsNames.includes(e));

        // Récupérer l'utilisateur par son token
        return User.findOne({ token: req.body.token }).then((user) => {
          if (!user) {
            return res.json({
              result: false,
              message: "Utilisateur non trouvé",
            });
          }

          // Créer le tweet
          const newPost = new Tweet({
            post: req.body.post,
            date: new Date(),
            user: user._id, // Associer l'utilisateur au tweet via son ObjectId
            hashtag: [], // Associer les ObjectId des hashtags (sera rempli après)
          });

          // Sauvegarder le tweet pour obtenir son _id
          return newPost.save().then((savedPost) => {
            // Créer et sauvegarder les nouveaux hashtags séquentiellement
            let hashtagPromises = newHashtags.map((newTag) => {
              const newHashtag = new Hashtag({
                hashtag: newTag,
                tweetId: savedPost._id,
              });
              return newHashtag.save();
            });

            const existingHashtagsPromises = dataHashtags.map(
              (existingHashtag) => {
                existingHashtag.tweetId.push(savedPost._id);
                return existingHashtag.save();
              }
            );

            return Promise.all([
              ...hashtagPromises,
              ...existingHashtagsPromises,
            ])
              .then((savedNewHashtags) => {
                const existingHashtagIds = dataHashtags.map((h) => h._id); // ObjectId des hashtags existants
                const newHashtagIds = savedNewHashtags.map((h) => h._id); // ObjectId des nouveaux hashtags
                // Combiner les ObjectId des hashtags existants et des nouveaux hashtags
                const allHashtagIds = [
                  ...new Set([...existingHashtagIds, ...newHashtagIds]),
                ];

                // Ajouter les hashtags au tweet et sauvegarder
                savedPost.hashtag = allHashtagIds;
                return savedPost.save();
              })
              .then((finalPost) => {
                res.json({ result: true, post: finalPost });
              });
          });
        });
      })
      .catch((error) => {
        res.json({
          result: false,
          message: "Erreur lors de la création du tweet",
          error,
        });
      });
  } else {
    // Si aucun hashtag n'est trouvé, créer simplement le post sans hashtags
    User.findOne({ token: req.body.token }).then((user) => {
      if (!user) {
        return res.json({ result: false, message: "Utilisateur non trouvé" });
      }

      const newPost = new Tweet({
        post: req.body.post,
        date: new Date(),
        user: user._id,
      });

      return newPost.save().then((post) => {
        res.json({ result: true, post });
      });
    });
  }
});

module.exports = router;

router.delete("/delete", async (req, res) => {
  const id = req.body.id;
  const deletedTweet = await Tweet.findOneAndDelete({ _id: id });
  const hashtags = deletedTweet.hashtag;
  let updatedHashtags;
  let deletedHashtags;
  if (hashtags.length > 0) {
    updatedHashtags = await Hashtag.updateMany(
      { _id: { $in: hashtags } },
      { $pull: { tweetId: id } }
    );
    deletedHashtags = await Hashtag.deleteMany({
      $expr: { $eq: [{ $size: "$tweetId" }, 0] },
    });
  }
  return res.json({
    message: "Tweet deleted successfully",
    deletedTweet,
    updatedHashtags,
  });
});

module.exports = router;
