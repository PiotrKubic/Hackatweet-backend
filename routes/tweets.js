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



router.post('/post', (req, res) => {
    const regex = /#\w+/g;

    // Récupérer les hashtags dans le post
    let tagtag = req.body.post.match(regex);

    // Si des hashtags sont présents
    if (tagtag) {
        // Rechercher les hashtags existants dans la base de données
        Hashtag.find({ hashtag: tagtag })
            .then(dataHashtags => {
                // Extraire les noms des hashtags existants
                const hashtagsNames = dataHashtags.map(h => h.hashtag);

                // Identifier les nouveaux hashtags qui ne sont pas encore dans la base
                const newHashtags = tagtag.filter(e => !hashtagsNames.includes(e));

                // Récupérer l'utilisateur par son token
                return User.findOne({ token: req.body.token })
                    .then(user => {
                        if (!user) {
                            return res.json({ result: false, message: 'Utilisateur non trouvé' });
                        }

                        // Créer le tweet
                        const newPost = new Tweet({
                            post: req.body.post,
                            date: new Date(),
                            user: user._id,  // Associer l'utilisateur au tweet via son ObjectId
                            hashtag: []  // Associer les ObjectId des hashtags (sera rempli après)
                        });

                        // Sauvegarder le tweet pour obtenir son _id
                        return newPost.save()
                            .then(savedPost => {
                                // Créer et sauvegarder les nouveaux hashtags séquentiellement
                                let hashtagPromises = newHashtags.map(newTag => {
                                    const newHashtag = new Hashtag({ hashtag: newTag, tweetId: savedPost._id });
                                    return newHashtag.save();
                                });

                                return Promise.all(hashtagPromises)
                                    .then(savedNewHashtags => {
                                        // Combiner les ObjectId des hashtags existants et des nouveaux hashtags
                                        const allHashtagIds = [
                                            ...dataHashtags.map(h => h._id),  // ObjectId des hashtags existants
                                            ...savedNewHashtags.map(h => h._id)  // ObjectId des nouveaux hashtags
                                        ];

                                        // Ajouter les hashtags au tweet et sauvegarder
                                        savedPost.hashtag = allHashtagIds;
                                        return savedPost.save();
                                    })
                                    .then(finalPost => {
                                        res.json({ result: true, post: finalPost });
                                    });
                            });
                    });
            })
            .catch(error => {
                res.json({ result: false, message: 'Erreur lors de la création du tweet', error });
            });
    } else {
        // Si aucun hashtag n'est trouvé, créer simplement le post sans hashtags
        User.findOne({ token: req.body.token })
            .then(user => {
                if (!user) {
                    return res.json({ result: false, message: 'Utilisateur non trouvé' });
                }

                const newPost = new Tweet({
                    post: req.body.post,
                    date: new Date(),
                    user: user._id
                });

                return newPost.save()
                    .then(post => {
                        res.json({ result: true, post });
                    });
            })
    }
});

module.exports = router;





router.delete('/delete', (req, res) => { /// ???? 
    Tweet.deleteOne( 
        {_id : req.body.id})
    .then(data =>
      res.json(data)
    )
    
    Hashtag.deleteOne( 
        {tweetId : req.body.tweetid}) //Je peux pas delete vu que le tweetid s'enregistre pas
    .then(data =>
      res.json(data)
    )
      
  });

module.exports = router;
