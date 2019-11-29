const functions = require('firebase-functions');

const app = require('express') ();

const { postReview } = require('./handlers/reviews');
const { showUserList, signUp, logIn, uploadImage, showUserbyID } = require('./handlers/users');
const { addActivity, showActivities, updateActivity, showActivitiesbyID, showRecommendedActivity, deleteActivity, uploadActivityImage, showActivitiesbyCityID, getStarRating, updateStarRating, showActivitiesComments, showRandomActivities } = require('./handlers/activities');
const { addTransportation, showTransportation, updateTransportation, showTransportationbyID, showRecommendedTransportation, deleteTransportation, uploadTransportationImage, showTransportationbyCityID } = require('./handlers/transportation');
const { addCity, showCityDetails, showCityList, updateCity, showRecommendedCity, deleteCity, uploadCityImage } = require('./handlers/cities');
const { addBooking, deleteBooking, showAllBooking } = require('./handlers/booking');

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
app.post('/activityImageUpload/:id', FBAuth, uploadActivityImage);
app.post('/activityRating', getStarRating);
app.get('/updateRating', updateStarRating);
app.get('/showComments', showActivitiesComments);

//Bookings
app.get('/bookingList', FBAuth, showAllBooking);
app.post('/addBooking', addBooking);
//app.put('/updateCityBooking', FBAuth, updateBooking);
app.delete('/deleteBooking/:id', FBAuth, deleteBooking);

//City
app.get('/cityById', showCityDetails);
app.get('/cityList', showCityList);
app.post('/addCity', FBAuth, addCity);
app.put('/updateCity', FBAuth, updateCity);
app.delete('/deleteCity/:id', FBAuth, deleteCity);
app.get('/cityByRecommended', showRecommendedCity);
app.post('/cityImageUpload/:id', FBAuth, uploadCityImage);

//Transportation
app.get('/transportationById', showTransportationbyID);
app.get('/transportationByCityId', showTransportationbyCityID);
app.get('/transportationList', showTransportation);
app.delete('/deleteTransportation/:id', FBAuth, deleteTransportation);
app.post('/addTransportation', FBAuth, addTransportation);
app.put('/updateTransportation', FBAuth, updateTransportation);
app.post('/transportationImageUpload/:id', FBAuth, uploadTransportationImage);

//Post/Add user review on the data base
app.post('/userReview', FBAuth, postReview);


exports.api = functions.region('asia-east2').https.onRequest(app);