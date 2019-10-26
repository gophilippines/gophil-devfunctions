const functions = require('firebase-functions');

const app = require('express') ();

const { postReview } = require('./handlers/reviews');
const { showUserList, signUp, logIn, uploadImage } = require('./handlers/users');
const { addActivity, showActivities, updateActivity, showActivitiesbyID, showRecommended, uploadActivityImage, showActivitiesbyCityID } = require('./handlers/activities');
const { addCity, showCityDetails, showCityList, updateCity } = require('./handlers/cities');

const FBAuth = require('./util/fbAuth');

//Users
app.get('/userList', showUserList);
app.post('/signup', signUp);
app.post('/login', logIn );
app.post('/user/image', FBAuth, uploadImage);

//Show All Activities Available
app.get('/activityById', showActivitiesbyID);
app.get('/activityByCityDd', showActivitiesbyCityID);
app.get('/activityList', showActivitiesbyID);
app.get('/activityByRecommended', showRecommended);
app.post('/addActivity', FBAuth, addActivity);
app.put('/updateActivity', FBAuth, updateActivity);
app.post('/activity/image', FBAuth, uploadActivityImage);

//City Functions
app.get('/cityById', showCityDetails);
app.get('/cityList', showCityList);
app.post('/addCity', FBAuth, addCity);
app.put('/updateCity', FBAuth, updateCity);

//Post/Add user review on the data base
app.post('/userReview', FBAuth, postReview);


exports.api = functions.region('asia-east2').https.onRequest(app);