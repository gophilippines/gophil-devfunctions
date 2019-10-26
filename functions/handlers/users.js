const { main, admin } = require("../util/admin");

const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const { validateSignUpData, validateLoginData } = require("../util/validators");

exports.showUserList = (req, res) => {
  main
    .collection("userList")
    .orderBy("dateCreated", "desc")
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
    .catch(err => console.error());
};

exports.signUp = (req, res) => {
  const newUser = {
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    contact_number: req.body.contact_number,
    email_address: req.body.email_address
    //    dateCreated: new Date().toISOString(),
    //    dateModified: new Date().toISOString()
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

  /*firebase.auth().createUserWithEmailAndPassword(newUser.email_address, newUser.password)
        .then(data => {
            return res.status(201).json({ message: `User ${data.user.uid} Signed up Successfully.`})
        })*/

  let token, userKey, noImg = 'no-img.png';

  main
    .doc(`/userList/${newUser.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: `Prefered username already taken.` });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(
            newUser.email_address,
            newUser.password
          );
      }
    })
    .then(data => {
      userKey = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
        contact_number: newUser.contact_number,
        email_address: newUser.email_address,
        userKey,
        imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };
      return main.doc(`/userList/${newUser.username}`).set(userCredentials);
      // return res.status(201).json({ token });
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ error: "Email Already in Use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

exports.logIn = (req, res) => {
  const userLogin = {
    email_address: req.body.email_address,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(userLogin);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(userLogin.email_address, userLogin.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Incorrect Credentials, Please Try Again" });
      } else return res.status(500).json({ Error: err.code });
    });
};

exports.uploadImage = (req, res) => {
  const busBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new busBoy({ headers: req.headers });

  let imageFN,
    imageUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return res.status(400).json({ Error: "Wrong File Type Submitted. "});
    }
    const imageExt = filename.split(".")[filename.split(".").length - 1];
    imageFN = `profile_${Math.round(Math.random() * 100000000000000)}.${imageExt}`;
    const filePath = path.join(os.tmpdir(), imageFN);
    imageUploaded = { filePath, mimetype };
    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", () => {
    admin
      .storage().bucket().upload(imageUploaded.filePath, {
          resumable: false,
          metadata: {
              contentType: imageUploaded.mimetype
          }
      })
      .then(() => {
        const imageURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFN}?alt=media`;
        return main.doc(`/userList/${req.user.username}`).update({ imageURL });
      })
      .then(() => {
          return res.json({ image: 'Image Uploaded Successfully' });
      })
      .catch(err => {
          console.error(err);
          return res.status(500).json({ error: err.code });
      })
  });
  busboy.end(req.rawBody);
};
