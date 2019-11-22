const { main, admin } = require('../util/admin');

const config = require("../util/config");

const { validateCityID } = require("../util/validators");

const transportationCollection = main.collection('transportation');
const cityCollection = main.collection('city');

exports.showTransportation = (req, res) => {
    transportationCollection
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let transpoData = [];
             data.forEach(doc => {
                 transpoData.push({
                    ...doc.data()
                 });
             });
             return res.json(transpoData);
        })
        .catch((err) => console.error());
}

exports.addTransportation = (req, res) => {
    if(req.body.company.trim() === '') {
        return res.status(400).json({ activity : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ activity : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ activity : 'Address must not be empty.'});
    }

    let id, noImg = 'default-img.png';

    const createTransportation = {
        city_id: req.query.id,
        id: "",
        address: req.body.address,
        details: req.body.details,
        company: req.body.company,
        price: req.body.price,
        createdBy: req.user.username,
        imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        recommended: Boolean(req.body.recommended)
    };

    const { valid, errors } = validateCityID(createTransportation);
    if (!valid) return res.status(400).json(errors);

    cityCollection.where('id', '==', req.query.id).get()
        .then(snapshot => {
            if(snapshot.empty){
                return res.status(404).json({ city_id: 'Not Found'});
            } else {
                transportationCollection
                 .add(createTransportation)
                 .then(doc => {
                    id = `${doc.id}`;
                    res.json({ message: `${doc.id} Activity successfully added` });
                    return main.doc(`/transportation/${doc.id}`).update({ id });
                    })
                 .catch(err => {
                    res.status(500).json({ error: 'Something went Wrong'});
                    console.error(err);
                })
            }
        })
}

exports.updateTransportation = (req, res) => {
    
    if(req.body.company.trim() === '') {
        return res.status(400).json({ activity : 'Company must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ activity : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ activity : 'Address must not be empty.'});
    }

    const updatedTransportation = {
        id: req.body.id,
        address: req.body.address,
        details: req.body.details,
        company: req.body.company,
        price: req.body.price,
        updatedBy: req.user.username,
        recommended: Boolean(req.body.recommended),
        dateModified: new Date().toISOString()
    };
    let sid = req.body.id;

    transportationCollection.where('id', '==', sid).get()
         .then(doc => {
            return main.doc(`/transportation/${sid}`).update( updatedTransportation );
            })
         .then(doc => {
            res.json({ message: `${sid} successfully updated` });
         })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}

exports.showTransportationbyID = (req, res) => {

    if(!req.query.id)
    {
        return res.status(400).json({ id: 'ID Required.'});
    } else {

        transportationCollection.where('id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ id: 'Not Found'});
                }
                
                snapshot.forEach(doc => {
                    let transportationData = doc.data();
                    return res.json(transportationData);
                });
        })
        .catch((err) => console.error());
    }
}

exports.showTransportationbyCityID = (req, res) => {

        transportationCollection.where('city_id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ city_id: 'No Available Transportation on this City'});
                }
                let transportationData = [];
                snapshot.forEach(doc => {
                    transportationData.push({
                       ...doc.data()
                    });
                });
                return res.json(transportationData);
        })
        .catch((err) => console.error());
}

exports.deleteTransportation = (req, res) => {
        const transportationDel = main.doc(`/transportation/${req.params.id}`);
        transportationDel.get()
            .then( doc => {
                if (!doc.exists) {
                    return res.json({ id: `Transportation ${req.params.id} not Found.`});
                }
                else {
                    transportationDel.delete();
                    return res.json({ id: 'Transportation Deleted.'})
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code});
            })
    //}
}

exports.uploadTransportationImage = (req, res) => {
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
          return main.doc(`/transportation/${req.params.id}`).update({ imageURL, dateModified: new Date().toISOString() });
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
  