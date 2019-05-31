var express = require('express');
const webpush = require('web-push');
const fbadmin = require('firebase-admin');
const util = require('util');
const n = require('./notifications.js');
const fbs = require('./fbs.js');

var router = express.Router();


// fbadmin.initializeApp(); // because of firebase hosting
fbadmin.initializeApp({
    credential: fbadmin.credential.cert(fbs.auth),
    databaseURL: fbs.databaseURL,
    databaseAuthVariableOverride: null,
});
const settings = {
    /* your settings... */
    timestampsInSnapshots: true
};
fbadmin.firestore().settings(settings);
// Get a reference to the database service
var fs = fbadmin.firestore();

webpush.setVapidDetails(n.email, n.VAPID_PUBLIC, n.VAPID_PRIVATE);

// const fakeDatabase = [];
router.post('/subscription', (req, res) => {
    // console.log('------req------');
    // console.log(res);
    const subscription = req.body;
    // const group_id = req.param('group');
    // console.log('param=' + req.param('group'));
    console.log('------body------subscription');
    // fakeDatabase.push(subscription);
    // const group_id = req.param('id');
    // Read the document.
    console.log('subscription.keys.auth - ', subscription.keys.auth);
    console.log('subscription.group_id - ', subscription.group_id);
    fs.collection('notifications')
        .where('keys.auth', '==', subscription.keys.auth)
        .where('group_id', '==', subscription.group_id)
        .get()
        .then((docs) => {
            console.log('docs.length', docs.length);
            if (docs.empty) {
                Object.assign(subscription, {
                    created: fbadmin.firestore.FieldValue.serverTimestamp()
                });
                fs.collection('notifications').doc().set(subscription);
                // console.log(sub_group);
                res.status(200).json({
                    message: 'Subscription ' + subscription.keys.auth + ' added successfully.'
                });
            } else {
                res.status(200).json({
                    message: 'Subscription ' + subscription.keys.auth + ' exists.'
                });
            }
            return null;
        })
        .catch((err) => {
            console.log('Error getting notifications', err);
        });
});

router.post('/sendnotifications', async (req, res, next) => {
    const b = req.body;
    // console.log('param=' + req.param('group'));
    console.log('------body------sendnotifications');
    // console.log(b);
    // console.log('req - ', req);
    console.log('body - ', b);
    const refDocs = await fs.collection('notifications').where('group_id', '==', b.group_id).get();
    console.log('docs.length', refDocs.docs.length);
    if (refDocs.docs.empty) {
        res.status(200).json({
            message: 'There are no subscribers for group: ' + b.group_id,
        })
    } else {
        // console.log('url-1', n.notificationPayload.notification.data.url_group);
        n.notificationPayload.notification.data.url_group =
            util.format(n.notificationPayload.notification.data.url_group,
                b.group_id, b.place_id
            )
        console.log('notification', n.notificationPayload.notification);
        // const errors = [];
        const promises = [];
        // try {
            for (doc of refDocs.docs) {
                // console.log(doc.id, '=>', doc.data());
                const subscription = doc.data(); //.subscription;
                promises.push(webpush.sendNotification(subscription, JSON.stringify(n.notificationPayload)));
            }
            // webpush.sendNotification(subscription, JSON.stringify(n.notificationPayload))
            Promise.all(promises)
                .then((r) => {
                    console.log('sent - r - ', r);
                    // res.send('Push notification published successfully.');
                    // errors.push({
                    //     r: r,
                    //     error: '',
                    //     message: 'Push notification published successfully.',
                    // })
                    // res.json({
                    //     message: 'Push notification published successfully.',
                    //     promises: promises
                    // });
                    return next();
                })
                .catch((e) => {
                    console.error('Error sending notification, reason: ', e);
                    // res.sendStatus(500);
                    // res.status(500).send('Some or all notifications failed to be published.');
                    // errors.push({
                    //     r: '',
                    //     error: e,
                    //     message: 'Some or all notifications failed to be published.',
                    // });
                    // res.status(500).json({
                    //     message: 'Some or all notifications failed to be published.',
                    //     e: e
                    // });
                    return next();
                });
        // } catch (err) {
        //     console.log(err);
        //     errors.push({
        //         error: JSON.stringify(err),
        //         message: 'Internal Error',
        //     })
        // }
        // }
        // Promise.all(promises)
        //     .then((r) => {
        //         console.log('promises - r - ', r);
        //         res.status(200).json({
        //             message: 'Newsletter sent successfully.',
        //             promises: promises
        //         })
        //         return null;
        //     })
        //     .catch(err => {
        //         console.error('Error sending notification, reason: ', err);
        //         res.sendStatus(500);
        //         return null;
        //     });
        console.log('return OK');
        res.json({message: 'Push notifications sent'});
        res.end();
    }
});

router.get('/all', (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    // res.send('uhra');
    // const v = ref.once('value').then(snap => snap.val())
    // res.send(v);
    // console.log(starCountRef);
    const r = [];
    fs.collection('notifications')
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                console.log(doc.data());
                // console.log(doc.id, '=>', doc.data());
                // res.send(doc.data());
                r.push(doc.data());
            });
            // console.log(r);
            res.status(200).json(r);
            return null;
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
});

module.exports = router;