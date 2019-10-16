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

const emailCheck = (email_address) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email_address.match(regEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

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
    
    let errors = {};

    if(isEmpty(newUser.email_address)) {
        errors.email_address = 'Must not be empty'
    } else if(!emailCheck(newUser.email_address)){
        errors.email_address = 'Please enter a valid Email'
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Password does not Match'
    if(isEmpty(newUser.userName)) errors.userName = 'Must not be empty'
    if(isEmpty(newUser.first_name)) errors.first_name = 'Must not be empty'
    if(isEmpty(newUser.last_name)) errors.last_name = 'Must not be empty'
    if(isEmpty(newUser.contact_number)) errors.contact_number = 'Must not be empty'

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

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

app.post('/login', (req, res) => {
    const userLogin = {
        email_address: req.body.email_address,
        password: req.body.password,
    };

    let errors = {};

    if(isEmpty(userLogin.email_address)) errors.email_address = 'Must not be empty';
    if(isEmpty(userLogin.password)) errors.password = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(userLogin.email_address, userLogin.password)
            .then(data => {
                return data.user.getIdToken();
            })
            .then(token => {
                return res.json({token});
            })
            .catch(err => {
                console.error(err);
                if(err.code === 'auth/wrong-password'){
                    return res.status(403).json({ General : 'Incorrect Credentials, Please Try Again'});
                } else return res.status(500).json({ Error: err.code });
            });
})

exports.api = functions.region('asia-east2').https.onRequest(app);