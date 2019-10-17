const { main } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config); 

const { validateSignUpData, validateLoginData } = require('../util/validators');

exports.showUserList = (req, res) => {
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
}

exports.signUp = (req, res) => {
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

    const { valid, errors } = validateSignUpData(newUser);
    if(!valid) return res.status(400).json(errors);

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
}

exports.logIn = (req, res) => {
    const userLogin = {
        email_address: req.body.email_address,
        password: req.body.password,
    };

    const { valid, errors } = validateLoginData(userLogin);
    if(!valid) return res.status(400).json(errors);

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
}