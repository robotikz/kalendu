var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");

var app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.get('/mailer-invite', (req, res) => {

    // create reusable transport method (opens pool of SMTP connections)
    var smtpTransport = nodemailer.createTransport({
        host: "w010ca9a.kasserver.com",
        port: 465,
        secure: true, // use SSL
        auth: {
            user: "alex@web-service-as.de",
            pass: "yGUgJ6cPnSP7GLhA"
        }
    });
    // sendMail(req.body);
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "alex@web-service-as.de", // sender address
        to: "alexandr.stoian@gmail.com", // list of receivers
        subject: "Hello", // Subject line
        text: "Hello world", // plaintext body
    }

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log("Message sent: " + response.message);
            res.send("Message sent: " + response.message);
        }
        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

    // res.send('Send Mail');
})

app.get('/mailer', (req, res) => {
    res.send('Mailer3!');
});

app.get('/', (req, res) => {
    res.send('home - Mailer!');
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