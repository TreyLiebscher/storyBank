'use strict';
const compression = require('compression')
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const os = require('os');
const path = require('path');
var minify = require('express-minify');

const {DATABASE_URL, TEST_DATABASE_URL, PORT} = require('../config.js');
const { setupRoutes } = require('./api/api.js');

const app = express();

app.use(compression({filter: shouldCompress}))

function shouldCompress (req, res) {
    console.log(req.url)

  if (/^\/story\/image/.test(req.path)) {
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

setupRoutes(app);

app.use(minify());
app.use('/app', express.static(path.join(__dirname, '../public')))


app.use('*', function (req, res) {
    res.status(404).json({message: 'Route not handled: malformed URL or non-existing static resource'});
});


let server;

function runHttpServer(port) {
    let resolved = false;
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`EXPRESS HTTP(S) SERVER STARTED ON PORT ${port}`);
            const hostname = os.hostname() || 'localhost';
            const now = new Date().toLocaleTimeString()
            console.log(`[ ${now} ] APP URL is: http://${hostname}:${port}`);
            resolved = true;
            resolve(server);
        }).on('error', err => {
            console.error('SERVER ERROR', err)
            if (!resolved) {
                reject(err);
            }
        });
    });
}

async function runServer(databaseUrl, port) {
    try {
        await mongoose.connect(databaseUrl, {useNewUrlParser: false});
        const dbMode = databaseUrl === TEST_DATABASE_URL ? 'TEST MODE' : 'PRODUCTION MODE';
        console.log(`MONGOOSE CONNECTED [${dbMode}]`);
        server = await runHttpServer(port);
        return server;
    } catch (ex) {
        mongoose.disconnect();
        console.error('CANNOT START SERVER', ex);
        return false;
    }
}
//cyclomatic complexity
async function closeServer() {
    try {
        await mongoose.disconnect();
        return await new Promise((resolve, reject) => {
            if (!server) {
                return resolve(true);
            }
            console.log('CLOSING SERVER');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        })
    } catch (ex) {
        console.error('CANNOT STOP SERVER', ex);
        return false;
    }
}

if (require.main === module) {
    runServer(DATABASE_URL, PORT).catch(err => console.error('CANNOT START SERVER', err));
}

module.exports = {app, runServer, closeServer};