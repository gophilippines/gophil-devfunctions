const functions = require('firebase-functions');

const app = require('express') ();

const { postReview } = require('./handlers/reviews');
const { showUserList, signUp, logIn, uploadImage } = require('./handlers/users');
const { addActivity, showActivities, updateActivity, showAActivities, showRecommended } = require('./handlers/activities');
const { addCity, showCity, updateCity } = require('./handlers/cities');

const FBAuth = require('./util/fbAuth');

//Users
app.get('/userList', showUserList);
app.post('/signup', signUp);
app.post('/login', logIn );
app.post('/user/image', FBAuth, uploadImage);

//Show All Activities Available
app.get('/activity', showAActivities);
app.get('/activitylist', FBAuth, showAActivities);
app.get('/recommended', showRecommended);
app.post('/activity', FBAuth, addActivity);
app.put('/activity', FBAuth, updateActivity);

//City Functions
app.get('/city', showCity);
app.post('/city', FBAuth, addCity);
app.put('/city', FBAuth, updateCity);

//Post/Add user review on the data base
app.post('/userReview', FBAuth, postReview);

//Signup Users


exports.api = functions.region('asia-east2').https.onRequest(app);