var express = require('express');
// const bodyParser = require('body-parser');
var nodemailer = require("nodemailer");
const Busboy = require('busboy');
const { google } = require('googleapis');
const p = require('./params.js');

var router = express.Router();


const gClientId = "455037071171-dc9flbb2gauh8o14fua32v6jsmvo33mh.apps.googleusercontent.com";
const gClientSecret = "lNjdKeHziAL8_EePmeAfvpei";
const gRefreshToken = "1/sNpi3fekyMtiHSWWWGUYWKw48z6U3LXfq13oKoGHMNo";
const oauth2Client = new google.auth.OAuth2(
    gClientId, // ClientID
    gClientSecret, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);
const gUser = "quizpiggy@gmail.com";

router.get('/m', (req, res) => {
    res.send('mailer 01');
});

router.post('/mailer', (req, res) => {
    console.log('------mailer------');
    oauth2Client.setCredentials({
        refresh_token: gRefreshToken
    });
    const accessToken = oauth2Client.getAccessToken(); // tokens.credentials.access_token;
    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: gUser,
            clientId: gClientId,
            clientSecret: gClientSecret,
            refreshToken: gRefreshToken,
            accessToken: accessToken
        }

    });

    const busboy = new Busboy({
        headers: req.headers
    });
    let m = null;
    // This code will process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
        // Process submitted field values here
        console.log(`Processed field ${fieldname}: ${val}.`);
        if (fieldname === 'json') {
            m = JSON.parse(val);
        }
        console.log(`Processed m: ${m}`);
        console.log(`Processed m - stringify: ${JSON.stringify(m)}`);
        var mailOptions = {
            // from: m.from || p.smtp.auth.user, // sender address
            // from: '"Bau.io" bau.io@gmail.com', // sender address
            from: `"Kalendu" ${p.smtp.auth.user}`,
            to: m.to, // list of receivers
            subject: m.subject, // Subject line
            html: m.body, // plaintext body
        }
        if (m.pdf) {
            mailOptions.attachments = [{ // use URL as an attachment
                filename: m.pdf.uid,
                path: m.pdf.url
            }, ]
        }
        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, (error, response) => {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                console.log("Message sent: " + JSON.stringify(response));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    'message': 'Message has been sent: ' +
                        m.to
                }));
            }
            // if you don't want to use this transport object anymore, uncomment following line
            smtpTransport.close(); // shut down the connection pool, no more messages
        });
    });
    busboy.on('finish', () => {});
    busboy.end(req.rawBody);
})

module.exports = router;