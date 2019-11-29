const { main, admin } = require('../util/admin');

const config = require("../util/config");

const { validateCityID, validateActivityID } = require("../util/validators");

const activityCollection = main.collection('activity');
const cityCollection = main.collection('city');
const bookingCollection = main.collection('booking');

exports.showAllBooking = (req, res) => {
    bookingCollection.get()
        .then(snapshot => {
             if(snapshot.empty){
                return res.status(404).json({ recommended: 'No Bookings Available'});
            }

            let bookingData = [];
            snapshot.forEach(doc => {
                bookingData.push({
                   ...doc.data()
                });
            });
            return res.json(bookingData);
    })
    .catch((err) => console.error());
}

exports.addBooking = (req, res) => {
    if(req.body.fullName.trim() === '') {
        return res.status(400).json({ booking : 'Full Name must not be empty.'});
    }
    let id, totalPrice;

    const createBooking = {
        activityID: req.query.id,
        packageID: "",
        id: "",
        fullName: req.body.fullName,
        email: req.body.email,
        contact: req.body.contact,
        date: new Date(req.body.date),
        nAdults: parseInt(req.body.nAdults),
        nChild: parseInt(req.body.nChild),
        totalPrice: parseInt(req.body.totalPrice),
        status: req.body.status,
        dateCreated: new Date(new Date().toISOString()),
        dateModified: new Date(new Date().toISOString())
    };

    const { valid, errors } = validateActivityID(createBooking);
    if (!valid) return res.status(400).json(errors);

    activityCollection.where('id', '==', req.query.id).get()
        .then(snapshot => {
            if(snapshot.empty){
                return res.status(404).json({ activityID: 'Not Found'});
            } else {
                bookingCollection
                 .add(createBooking)
                 .then(doc => {
                    id = `${doc.id}`;
                    //let nChild = parseInt(req.body.nChild), nAdults = parseInt(req.body.nAdults);
                    //let activityDoc = main.doc(`/activity/${req.query.id}`);
                    //totalPrice = parseFloat(activityDoc.price * (nChild+nAdults));
                    res.json({ message: `${doc.id} Booking Successful` });
                    return main.doc(`/booking/${doc.id}`).update({ id });
                    })
                 .catch(err => {
                    res.status(500).json({ error: 'Something went Wrong'});
                    console.error(err);
                })
            }
        })
}

exports.deleteBooking = (req, res) => {
        const bookingDel = main.doc(`/booking/${req.params.id}`);
        bookingDel.get()
            .then( doc => {
                if (!doc.exists) {
                    return res.json({ id: `Booking ${req.params.id} not Found.`});
                }
                else {
                    bookingDel.delete();
                    return res.json({ id: 'Booking Deleted.'})
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code});
            })
    //}
}