const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
var mailer = require('./mailer.js');
var pusher = require('./pusher.js');




const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors());
app.use(bodyParser.json());



var router = express.Router();

app.use((req, res, next) => {
    var allowedOrigins = ['http://127.0.0.1:4200', 'http://localhost:4200', 'https://kalendu.de'];
    var origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        // res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    // res.header('Access-Control-Allow-Credentials', true);
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
});

router.get('/test', (req, res) => {
    res.send('home - pusher test 16');
});

router.use('/', mailer);
// app.use('/api', mailer);
router.use('/', pusher);
// app.use('/api', pusher);

app.use('/api', router);

module.exports = app;