const { main } = require('../util/admin');

exports.addCity = (req, res) => {
    if(req.body.name.trim() === '') {
        return res.status(400).json({ City : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ City : 'Details must not be empty.'});
    }
    if(req.body.location.trim() === '') {
        return res.status(400).json({ City : 'Location must not be empty.'});
    }

    let id;

    const createCity = {
        id: "",
        location: req.body.location,
        details: req.body.details,
        name: req.body.name,
        createdBy: req.user.username,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
    };

    main
         .collection('city')
         .add(createCity)
         .then(doc => {
            id = `${doc.id}`;
            res.json({ message: `New ${doc.id} successfully added` });
            return main.doc(`/city/${doc.id}`).update({ id });
            })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}

exports.updateCity = (req, res) => {
    
    if(req.body.name.trim() === '') {
        return res.status(400).json({ City : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ City : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ City : 'Address must not be empty.'});
    }

    const updatedcity = {
        id: req.body.id,
        location: req.body.location,
        name: req.body.name,
        updatedBy: req.user.username,
        dateModified: new Date().toISOString(),
    };
    let sid = req.body.id;

     main.collection('city')
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

exports.showCity = (req, res) => {

    if(!req.query.id)
    {
        main
        .collection('city')
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let cityData = [];
             data.forEach(doc => {
                 cityData.push({
                    cityID: doc.id,
                    ...doc.data()
                 });
             });
             return res.json(cityData);
        })
    } else {

        main
            .collection('city').where('id', '==', req.query.id).get()
            .then(snapshot => {
                 if(snapshot.empty){
                    return res.status(404).json({ ID: 'Not Found'});
                }

                let cityData = [];
                snapshot.forEach(doc => {
                    cityData.push({
                       id: `${req.query.id}`,
                       ...doc.data()
                    });
                });
                return res.json(cityData);
        })
        .catch((err) => console.error());
    }
}