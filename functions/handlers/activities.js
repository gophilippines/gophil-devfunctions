const { main } = require('../util/admin');

/*const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config); */

exports.showActivities = (req, res) => {
    main
        .collection('activity')
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let activityData = [];
             data.forEach(doc => {
                 activityData.push({
                    id: doc.id,
                    ...doc.data()
                 });
             });
             return res.json(activityData);
        })
        .catch((err) => console.error());
}

exports.addActivity = (req, res) => {
    if(req.body.name.trim() === '') {
        return res.status(400).json({ Activiy : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ Activiy : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ Activiy : 'Address must not be empty.'});
    }

    let id;

    const createActivity = {
        id: "",
        address: req.body.address,
        details: req.body.details,
        name: req.body.name,
        price: req.body.price,
        createdBy: req.user.username,
        dateCreated: new Date().toISOString(),
    };

    main
         .collection('activity')
         .add(createActivity)
         .then(doc => {
            id = `${doc.id}`;
            res.json({ message: `New ${doc.id} successfully added` });
            return main.doc(`/activity/${doc.id}`).update({ id });
            })
         .catch(err => {
             res.status(500).json({ error: 'Something went Wrong'});
             console.error(err);
         })
}

exports.updateActivity = (req, res) => {
    
    if(req.body.name.trim() === '') {
        return res.status(400).json({ Activiy : 'Name must not be empty.'});
    }
    if(req.body.details.trim() === '') {
        return res.status(400).json({ Activiy : 'Details must not be empty.'});
    }
    if(req.body.address.trim() === '') {
        return res.status(400).json({ Activiy : 'Address must not be empty.'});
    }

    const updatedActivity = {
        id: req.body.id,
        address: req.body.address,
        details: req.body.details,
        name: req.body.name,
        price: req.body.price,
        updatedBy: req.user.username,
        dateModified: new Date().toISOString(),
    };
    let sid = req.body.id;

     main.collection('activity')
         .where('id', '==', sid).get()
         .then(doc => {
            //updatedActivity.dateCreated = sid.dateCreated;
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

exports.showAActivities = (req, res) => {

    if(!req.query.id)
    {
        main
        .collection('activity')
        .orderBy('dateCreated', 'desc')
        .get()
        .then(data => {
             let activityData = [];
             data.forEach(doc => {
                 activityData.push({
                    id: doc.id,
                    ...doc.data()
                 });
             });
             return res.json(activityData);
        })
    } else {

        main
            .collection('activity').where('id', '==', req.query.id).get()
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