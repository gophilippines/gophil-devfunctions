const functions = require('firebase-functions');

const app = require('express') ();

const { postReview } = require('./handlers/reviews');
const { showUserList, signUp, logIn, uploadImage } = require('./handlers/users');
const { addActivity, showActivities, updateActivity } = require('./handlers/activities');

const FBAuth = require('./util/fbAuth');

//Users
app.get('/userList', showUserList);
app.post('/signup', signUp);
app.post('/login', logIn );
app.post('/user/image', FBAuth, uploadImage);

//Show All Activities Available
app.get('/activity', showActivities);
app.post('/activity', FBAuth, addActivity);
app.put('/activity', FBAuth, updateActivity);
//Post/Add user review on the data base
app.post('/userReview', FBAuth, postReview);

//Signup Users


exports.api = functions.region('asia-east2').https.onRequest(app);