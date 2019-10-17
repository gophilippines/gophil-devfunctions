const { main } = require('../util/admin');

exports.postReview = (req, res) => {
    if(req.body.review.trim() === '') {
        return res.status(400).json({ Review : 'Review must not be empty.'});
    }

    const createReview = {
        review: req.body.review,
        userName: req.user.userName,
        dateCreated: new Date().toISOString(),
    };

    main
         .collection('userReview')
         .add(createReview)
         .then(doc => {
            res.json({ message: `New ${doc.id} successfully added` });
         })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}