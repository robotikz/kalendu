const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');
const fbadmin = require('firebase-admin');
const util = require('util');
const n = require('../notifications.js');
const fbs = require('../fbs.js');


// const tunnel = require('tunnel2')
// Create your Proxy Agent 
// Please choose your tunneling method accordingly, my case
// is httpsoverHttp, yours might be httpsoverHttps
// const proxyAgent = tunnel.httpsOverHttp({
//     proxy: {
//         host: 'pro-int.brz.fiducia.de',
//         port: '8080',
//         proxyAuth: 'yc0p401:windaDa4Me20821' // Optional, required only if your proxy require authentication
//     }
// });

fbadmin.initializeApp({
    credential: fbadmin.credential.cert(fbs.auth),
    databaseURL: fbs.databaseURL,
    databaseAuthVariableOverride: null,
});
const settings = { /* your settings... */
    timestampsInSnapshots: true
};
fbadmin.firestore().settings(settings);


// Get a reference to the database service
var fs = fbadmin.firestore();

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(bodyParser.json());

webpush.setVapidDetails(n.email, n.VAPID_PUBLIC, n.VAPID_PRIVATE);


// const fakeDatabase = [];
app.post('/subscription', (req, res) => {
    // console.log('------req------');
    // console.log(res);
    const subscription = req.body;
    // const group_id = req.param('group');
    // console.log('param=' + req.param('group'));
    console.log('------body------subscription');
    // fakeDatabase.push(subscription);
    // const group_id = req.param('id');
    // Read the document.
    console.log(subscription.keys.auth);
    console.log(subscription.group_id);
    fs.collection('notifications')
        .where('keys.auth', '==', subscription.keys.auth)
        .where('group_id', '==', subscription.group_id)
        .get()
        .then((docs) => {
            console.log('docs.size', docs.size);
            if (docs.size <= 0) {
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

app.post('/sendnotifications', (req, res) => {
    const b = req.body;
    // console.log('param=' + req.param('group'));
    console.log('------body------sendnotifications');
    console.log(b);
    const promises = [];
    fs.collection('notifications')
        .where('group_id', '==', b.group_id)
        .get()
        .then((docs) => {
            console.log('docs.size', docs.size);
            if (docs.size <= 0) {
                res.status(200).json({
                    message: 'There are no subscribers for group: ' + b.group_id,
                })
            } else {
                // console.log('url-1', n.notificationPayload.notification.data.url_group);
                n.notificationPayload.notification.data.url_group =
                    util.format(n.notificationPayload.notification.data.url_group,
                        b.group_id, b.place_id
                    )
                console.log('url-2', n.notificationPayload.notification.data.url_group);
                docs.forEach((doc) => {
                    // console.log(doc.id, '=>', doc.data());
                    const subscription = doc.data(); //.subscription;
                    promises.push(webpush.sendNotification(subscription, JSON.stringify(n.notificationPayload)));
                });
                Promise.all(promises)
                    .then(() => {
                        // console.log(doc.id, '=>', doc.data());
                        res.status(200).json({
                            message: 'Newsletter sent successfully.',
                            promises: promises
                        })
                        return null;
                    })
                    .catch(err => {
                        console.error('Error sending notification, reason: ', err);
                        res.sendStatus(500);
                        return null;
                    });
            }
            return null;
        })
        .catch((err) => {
            console.log('Error getting notifications', err);
        });

    // console.log(notificationPayload.notification);

    // fakeDatabase.forEach(subscription => {
    //     promises.push(webpush.sendNotification(subscription, JSON.stringify(notificationPayload)));
    // });

});

app.get('/all', (req, res) => {
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

var port = normalizePort(process.env.PORT || '443');
app.set('port', port);

app.listen(port, () => {
    console.log('Server started on port ' + port);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}