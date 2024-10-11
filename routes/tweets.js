var express = require('express');
var router = express.Router();

const Tweet = require('../models/tweets');
const User = require('../models/users');
const Hashtag = require('../models/hashtags');

router.get('/', (req, res) => {
    Tweet.find()
    .then(data =>
      res.json(data)
    )
  });


router.get('/tag', (req, res) => {
Hashtag.find()
.then(data =>
    res.json(data)
)
});



router.post('/post', async (req, res) => {
    try {
        const regex = /#\w+/g;

        //recup le hashtag dans le post
        let tagtag = req.body.post.match(regex);
        //Si il y a bien un hashtag
        if (tagtag) {
            // Rechercher les hashtags existants dans la base de données
            const dataHashtags = await Hashtag.find({ hashtag: tagtag });

            // Extraire les noms des hashtags existants
            const hashtagsNames = dataHashtags.map(h => h.hashtag);

            // Identifier les nouveaux hashtags (qui ne sont pas encore dans la base)
            const newHashtags = tagtag.filter(e => !hashtagsNames.includes(e));

            // Créer et sauvegarder les nouveaux hashtags de manière séquentielle sans Promise.all
            let savedNewHashtags = [];
            for (let newTag of newHashtags) {
                const newHashtag = new Hashtag({ hashtag: newTag , tweetId: newPost._id }); //probleme pour ajouter l'id du tweet dans le document
                const savedHashtag = await newHashtag.save();
                savedNewHashtags.push(savedHashtag);
            }

            // Combiner les ObjectId des hashtags existants et des nouveaux hashtags
            const allHashtagIds = [
                ...dataHashtags.map(h => h._id),  // ObjectId des hashtags existants
                ...savedNewHashtags.map(h => h._id)  // ObjectId des nouveaux hashtags
            ];

            // Récupérer l'utilisateur par son token
            const user = await User.findOne({ token: req.body.token });

            if (!user) {
                return res.status(404).json({ result: false, message: 'Utilisateur non trouvé' });
            }

            // Créer le tweet avec les ObjectId des hashtags
            const newPost = new Tweet({
                post: req.body.post,
                date: new Date(),
                user: user._id,  // Associer l'utilisateur au tweet via son ObjectId
                hashtag: allHashtagIds  // Associer les ObjectId des hashtags
            });

            // Sauvegarder le tweet
            const post = await newPost.save();

            res.json({ result: true, post });

        } else {
            // Si aucun hashtag n'est trouvé, créer simplement le post sans hashtags
            const user = await User.findOne({ token: req.body.token });

            if (!user) {
                return res.status(404).json({ result: false, message: 'Utilisateur non trouvé' });
            }

            const newPost = new Tweet({
                post: req.body.post,
                date: new Date(),
                user: user._id
            });

            const post = await newPost.save();
            res.json({ result: true, post });
        }
    } catch (error) {
        res.status(500).json({ result: false, message: 'Erreur lors de la création du tweet', error });
    }
});

module.exports = router;


router.delete('/delete', (req, res) => { /// ???? WTF
    Tweet.deleteOne( 
        {_id : req.body.id})
    .then(data =>
      res.json(data)
    )
    
    Hashtag.deleteOne( 
        {tweetId : req.body.tweetid})
    .then(data =>
      res.json(data)
    )
      
  });

module.exports = router;
