const { main, admin } = require('../util/admin');

const config = require("../util/config");

const { validateCityID } = require("../util/validators");

const activityCollection = main.collection('activity');
const cityCollection = main.collection('city');

exports.showActivities = (req, res) => {
    activityCollection
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let activityData = [];
             data.forEach(doc => {
                 activityData.push({
                    ...doc.data()
                 });
             });
             return res.json(activityData);
        })
        .catch((err) => console.error());
}

exports.addActivity = (req, res) => {
    if(req.body.name.trim() === '') {
        return res.status(400).json({ activity : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ activity : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ activity : 'Address must not be empty.'});
    }

    let id, noImg = 'default-img.png';

    const createActivity = {
        city_id: req.query.id,
        id: "",
        address: req.body.address,
        details: req.body.details,
        name: req.body.name,
        price: req.body.price,
        createdBy: req.user.username,
        imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        recommended: Boolean(req.body.recommended)
    };

    const { valid, errors } = validateCityID(createActivity);
    if (!valid) return res.status(400).json(errors);

    cityCollection.where('id', '==', req.query.id).get()
        .then(snapshot => {
            if(snapshot.empty){
                return res.status(404).json({ city_id: 'Not Found'});
            } else {
                activityCollection
                 .add(createActivity)
                 .then(doc => {
                    id = `${doc.id}`;
                    res.json({ message: `${doc.id} Activity successfully added` });
                    return main.doc(`/activity/${doc.id}`).update({ id });
                    })
                 .catch(err => {
                    res.status(500).json({ error: 'Something went Wrong'});
                    console.error(err);
                })
            }
        })
}

exports.updateActivity = (req, res) => {
    
    if(req.body.name.trim() === '') {
        return res.status(400).json({ activity : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ activity : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ activity : 'Address must not be empty.'});
    }

    const updatedActivity = {
        id: req.body.id,
        address: req.body.address,
        details: req.body.details,
        name: req.body.name,
        price: parseInt(req.body.price),
        updatedBy: req.user.username,
        recommended: Boolean(req.body.recommended),
        dateModified: new Date().toISOString()
    };
    let sid = req.body.id;

    activityCollection.where('id', '==', sid).get()
         .then(doc => {
            return main.doc(`/activity/${sid}`).update( updatedActivity );
            })
         .then(doc => {
            res.json({ message: `${sid} successfully updated` });
         })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}

exports.showRandomActivities = (req, res) => {

    if(!req.query.id)
    {
        activityCollection
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let activityData = [], randActivity = [];
             data.forEach(doc => {
                 activityData.push({
                    ...doc.data()
                 });
             });
             for (let i = 0; i < 4; i++) {
                 let x = Math.round(Math.random() * activityData.length) - 1;
                randActivity.push(activityData[x]);
             }
             return res.json(randActivity);
        })

    } else {

        activityCollection.where('id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ ID: 'Not Found'});
                }

                let activityData = [];
                snapshot.forEach(doc => {
                    activityData.push({
                       id: `${req.query.id}`,
                       ...doc.data()
                    });
                });
                return res.json(activityData);
        })
        .catch((err) => console.error());
    }
}

exports.showActivitiesbyID = (req, res) => {

    if(!req.query.id)
    {
        return res.status(400).json({ id: 'ID Required.'});
    } else {

        activityCollection.where('id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ id: 'Not Found'});
                }
                
                let activityData = [];
                snapshot.forEach(doc => {
                    let activityData = doc.data();
                    return res.json(activityData);
                });
        })
        .catch((err) => console.error());
    }
}

exports.showActivitiesbyCityID = (req, res) => {

        activityCollection.where('city_id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ city_id: 'No Available Activity on this City'});
                }
                let activityData = [];
                snapshot.forEach(doc => {
                    activityData.push({
                       ...doc.data()
                    });
                });
                return res.json(activityData);
        })
        .catch((err) => console.error());
}

exports.showRecommendedActivity = (req, res) => {
        activityCollection.where('recommended', '==', true).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ recommended: 'No Recommended Activity Available'});
                }

                let activityData = [];
                snapshot.forEach(doc => {
                    activityData.push({
                       ...doc.data()
                    });
                });
                return res.json(activityData);
        })
        .catch((err) => console.error());
}

exports.getStarRating = (req, res) => {

    if(req.body.comment.trim() === '') {
        return res.status(400).json({ comment : 'Comment must not be empty.'});
    }

    const createReview = {
        id: '',
        activityID: req.query.id,
        comment: req.body.comment,
        email: req.body.email,
        name: req.body.name,
        dateCreated: new Date().toISOString(),
        rate: req.body.rate
    };

    main.collection('starRating')
        .add(createReview)
        .then(doc => {
            id = `${doc.id}`;
            res.json({ message: `${doc.id} Review successfully added` });
            main.doc(`/starRating/${doc.id}`).update({ id });
        })
        .catch(err => {
            res.status(500).json({ error: 'Something went Wrong'});
            console.error(err);
        })
}

exports.updateStarRating = (req, res) => {    
    let rating = 0, ratingList = [], totalRatingCount;

    main.collection('starRating').where('activityID', '==', req.query.id).get()
        .then( doc => {
            doc.forEach(doc => {
                ratingList.push( doc.data().rate );
            });
            for ( let i = 0; i < ratingList.length; i++) {
                rating+=ratingList[i];
            }
            rating /= ratingList.length;
            rating = parseFloat(parseFloat(rating).toFixed(2));
            totalRatingCount = ratingList.length;
            return res.json(rating);
        })
        .then( doc => {
            return main.doc(`/activity/${req.query.id}`).update({ rating, totalRatingCount });
        })
}

exports.deleteActivity = (req, res) => {
    //if(!req.query.id)
    //{
    //    return res.status(400).json({ id: 'ID Required.'});
    //} else {
       //activityCollection.where('id', '==', req.params.id).get()
        const activityDel = main.doc(`/activity/${req.params.id}`);
        activityDel.get()
            .then( doc => {
                if (!doc.exists) {
                    return res.json({ id: `Activity ${req.params.id} not Found.`});
                }
                else {
                    activityDel.delete();
                    return res.json({ id: 'Activity Deleted.'})
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code});
            })
    //}
}

exports.showActivitiesComments = (req, res) => {
    if(!req.query.id)
    {
        return res.status(400).json({ id: 'ID Required.'});
    } else {

        main.collection('starRating').where('activityID', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ comment: 'No Comments Available'});
                }
                
                let commentData = [];
                snapshot.forEach(doc => {
                    commentData.push({name: doc.data().name, id: doc.data().id, rate: doc.data().rate, comment: doc.data().comment, dateCreated: doc.data().dateCreated})
                });
                return res.json(commentData);
        })
        .catch((err) => console.error());
    }
}

exports.uploadActivityImage = (req, res) => {
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
      imageFN = `activity_${Math.round(Math.random() * 100000000000000)}.${imageExt}`;
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
          return main.doc(`/activity/${req.params.id}`).update({ imageURL, dateModified: new Date().toISOString() });
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
  