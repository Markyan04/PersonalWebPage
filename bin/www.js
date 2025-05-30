import { server, app } from '../app.js';
import debugModule from 'debug';
import dotenv from 'dotenv';

const debug = debugModule('webassignment:server');
dotenv.config();

const port = normalizePort(process.env.PORT || '7000');
const hostname = process.env.HOSTNAME || '127.0.0.1';
app.set('port', port);


server.listen(port, hostname, () => {
    if (process.env.HOSTNAME === '0.0.0.0') {
        console.log(`Server running at http://${process.env.HOSTNAME_NICKNAME}:${port}/`);
    }
    else {
        console.log(`Server running at http://${hostname}:${port}/`);
    }
});

server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    const port = parseInt(val, 10);

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

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
    debug('Listening on ' + bind);
}