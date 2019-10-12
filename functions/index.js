const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express') ();

admin.initializeApp();
const main = admin.firestore();

const config = {
    apiKey: "AIzaSyCcJdVaArUnGi1Fl-h00rrdw_DeU2NZh4Q",
    authDomain: "dev-gophil-1009.firebaseapp.com",
    databaseURL: "https://dev-gophil-1009.firebaseio.com",
    projectId: "dev-gophil-1009",
    storageBucket: "dev-gophil-1009.appspot.com",
    messagingSenderId: "183652715916",
    appId: "1:183652715916:web:0f6c318d582fa4d2451aa9",
    measurementId: "G-P67BQQX9B0"
  };

const firebase = require('firebase');
firebase.initializeApp(config);

//Show Data inside the Collection
app.get('/userList', (req, res) => {
    main
        .collection('userList')
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let usersData = [];
             data.forEach(doc => {
                 usersData.push({
                    userID: doc.id,
                    ...doc.data()
                 });
             });
             return res.json(usersData);
        })
        .catch((err) => console.error());
});

//Pass Data for Collection
app.post('/users', (req, res) => {
    const createUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        contact_number: req.body.contact_number,
        email_address: req.body.email_address,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
    };

    main
         .collection('users')
         .add(createUser)
         .then(doc => {
            res.json({ message: `New ${doc.id} successfully added` });
         })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
});

//TODO Signup Users
app.post('/signup', (req, res) => {
    const newUser = {
        userName: req.body.userName,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        contact_number: req.body.contact_number,
        email_address: req.body.email_address,
    //    dateCreated: new Date().toISOString(),
    //    dateModified: new Date().toISOString() 
    };

    /*firebase.auth().createUserWithEmailAndPassword(newUser.email_address, newUser.password)
        .then(data => {
            return res.status(201).json({ message: `User ${data.user.uid} Signed up Successfully.`})
        })*/
    
    let token, userKey;

      main.doc(`/userList/${newUser.userName}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ userName: `Prefered userName already taken.`});
            } else { 
                return firebase
                .auth()
                .createUserWithEmailAndPassword(newUser.email_address, newUser.password);
            }
        })
        .then(data => {
            userKey = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                userName: newUser.userName,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                password: newUser.password,
                confirmPassword: newUser.confirmPassword,
                contact_number: newUser.contact_number,
                email_address: newUser.email_address,
                userKey,
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString()
            };
            return main.doc(`/userList/${newUser.userName}`).set(userCredentials);
           // return res.status(201).json({ token });
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({ error: 'Email Already in Use'})
            } else {
            return res.status(500).json({ error: err.code });
            }
        })
});

exports.api = functions.region('asia-east2').https.onRequest(app);