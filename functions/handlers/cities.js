const { main, admin } = require('../util/admin');

const config = require("../util/config");

const cityCollection = main.collection('city');

exports.addCity = (req, res) => {
    if(req.body.name.trim() === '') {
        return res.status(400).json({ city : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ city : 'Details must not be empty.'});
    }
    if(req.body.location.trim() === '') {
        return res.status(400).json({ city : 'Location must not be empty.'});
    }

    let id, location, noImg = 'default-img.png' , loc = req.body.location, lat = loc.split(', ')[0], lng = loc.split(', ')[1];

    const createCity = {
        id: "",
        location: new admin.firestore.GeoPoint(parseFloat(req.body.location.split(", ")[0]), parseFloat(req.body.location.split(", ")[1])),
        details: req.body.details,
        name: req.body.name,
        createdBy: req.user.username,
        imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
    };

    cityCollection
         .add(createCity)
         .then(doc => {
            id = `${doc.id}`;
            //location = new main.firestore.Geopoint(lat, lng);
            res.json({ message: `${doc.id} City successfully added` });
            return main.doc(`/city/${doc.id}`).update({ id });
            })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}

exports.updateCity = (req, res) => {
    
    if(req.body.name.trim() === '') {
        return res.status(400).json({ city : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ city : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ city : 'Address must not be empty.'});
    }

    const updatedcity = {
        id: req.body.id,
        //location: new admin.firestore.GeoPoint(parseFloat(req.body.location.split(", ")[0]), parseFloat(req.body.location.split(", ")[1])),
        name: req.body.name,
        updatedBy: req.user.username,
        dateModified: new Date().toISOString(),
    };
    let sid = req.body.id;

     cityCollection
         .where('id', '==', sid).get()
         .then(doc => {
            //updatedcity.dateCreated = sid.dateCreated;
            return main.doc(`/city/${sid}`).update( updatedcity );
            })
         .then(doc => {
            res.json({ message: `${sid} successfully updated` });
         })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}

exports.deleteCity = (req, res) => {
    //if(!req.query.id)
    //{
    //    return res.status(400).json({ id: 'ID Required.'});
    //} else {
       //activityCollection.where('id', '==', req.params.id).get()
        const cityDel = main.doc(`/city/${req.params.id}`);
        cityDel.get()
            .then( doc => {
                if (!doc.exists) {
                    return res.json({ id: `City ${req.params.id} not Found.`});
                }
                else {
                    cityDel.delete();
                    return res.json({ id: 'City Deleted.'})
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code});
            })
    //}
}

exports.showCityDetails = (req, res) => {

    if(!req.query.id)
    {
       return res.status(400).json({ message: 'ID Required'});
    } else {
        cityCollection.where('id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ id: 'Not Found'});
                }
                snapshot.forEach(doc => {
                    let cityData = doc.data();
                    return res.json(cityData);
                });
                
        })
        .catch((err) => console.error());
    }
}

exports.showRecommendedCity = (req, res) => {
    cityCollection.where('recommended', '==', true).get()
        .then(snapshot => {
             if(snapshot.empty){
                return res.status(404).json({ recommended: 'No Recommended City Available'});
            }

            let cityData = [];
            snapshot.forEach(doc => {
                cityData.push({
                   ...doc.data()
                });
            });
            return res.json(cityData);
    })
    .catch((err) => console.error());
}

exports.showCityList = (req, res) => {
    cityCollection.get()
            .then(data => {
                 if(data.empty){
                    return res.status(404).json({ id: 'Not Found'});
                   }
                let cityList = [];
                data.forEach(doc => {
                    cityList.push({name: doc.data().name, id: doc.data().id});
                });
                return res.json(cityList);
        })
        .catch((err) => console.error());
}