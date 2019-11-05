const functions = require('firebase-functions');

const app = require('express') ();

const { postReview } = require('./handlers/reviews');
const { showUserList, signUp, logIn, uploadImage, showUserbyID } = require('./handlers/users');
const { addActivity, showActivities, updateActivity, showActivitiesbyID, showRecommendedActivity, deleteActivity, uploadActivityImage, showActivitiesbyCityID, getStarRating, updateStarRating, showActivitiesComments, showRandomActivities } = require('./handlers/activities');
const { addCity, showCityDetails, showCityList, updateCity, showRecommendedCity, deleteCity } = require('./handlers/cities');

const FBAuth = require('./util/fbAuth');

//Users
app.get('/userList', showUserList);
app.get('/userById', showUserbyID);
app.post('/signup', signUp);
app.post('/login', logIn );
app.post('/user/image', FBAuth, uploadImage);

//Activity
app.get('/activityById', showActivitiesbyID);
app.get('/activityByCityId', showActivitiesbyCityID);
app.get('/activityRandom', showRandomActivities);
app.get('/activityList', showActivities);
app.get('/activityByRecommended', showRecommendedActivity);
app.delete('/deleteActivity/:id', FBAuth, deleteActivity);
app.post('/addActivity', FBAuth, addActivity);
app.put('/updateActivity', FBAuth, updateActivity);
//app.post('/activityImageUpload', FBAuth, uploadActivityImage);
app.post('/activityImageUpload/:id', FBAuth, uploadActivityImage);
app.post('/activityRating', getStarRating);
app.get('/updateRating', updateStarRating);
app.get('/showComments', showActivitiesComments);

//City
app.get('/cityById', showCityDetails);
app.get('/cityList', showCityList);
app.post('/addCity', FBAuth, addCity);
app.put('/updateCity', FBAuth, updateCity);
app.delete('/deleteCity/:id', FBAuth, deleteCity);
app.get('/cityByRecommended', showRecommendedCity);

//Post/Add user review on the data base
app.post('/userReview', FBAuth, postReview);


exports.api = functions.region('asia-east2').https.onRequest(app);