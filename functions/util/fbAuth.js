const { main } = require('./admin');

module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer: ')){
        idToken = req.headers.authorization.split('Bearer: ')[1];
    } else {
        console.error('No Token Found')
        return res.status(403).json({ Error: 'Unauthorized'});
    }

    admin.auth().verifyIdToken(idToken)
         .then(decodedToken => {
             req.user = decodedToken;
             console.log(decodedToken);
             return main.collection('userList')
                        .where('userKey', '==', req.user.uid)
                        .limit(1)
                        .get();
         })
         .then(data => {
             req.user.userName = data.docs[0].data().userName;
             return next();
         })
         .catch(err => {
             console.error('Error on Token ', err);
             return res.status(403).json(err);
         })
}