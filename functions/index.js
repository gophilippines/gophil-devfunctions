const functions = require('firebase-functions');

const app = require('express') ();

const { postReview } = require('./handlers/reviews');
const { showUserList, signUp, logIn } = require('./handlers/users');

const FBAuth = require('./util/fbAuth');

//Show All user inside the Collection
app.get('/userList', showUserList);
//Post/Add user review on the data base
app.post('/userReview', FBAuth, postReview);
//Signup Users
app.post('/signup', signUp);
//Login User
app.post('/login', logIn );

exports.api = functions.region('asia-east2').https.onRequest(app);