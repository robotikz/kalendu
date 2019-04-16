const app = require('./app');

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