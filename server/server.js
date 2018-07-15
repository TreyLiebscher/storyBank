'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const os = require('os');

const {DATABASE_URL, TEST_DATABASE_URL, PORT} = require('../config.js');
const { setupRoutes } = require('./api/api.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

setupRoutes(app);

app.use('*', function (req, res) {
    res.status(404).json({message: 'Route not handled: malformed URL or non-existing static resource'});
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
});

let server;

function runHttpServer(port) {
    let resolved = false;
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`EXPRESS HTTP(S) SERVER STARTED ON PORT ${port}`);
            const hostname = os.hostname() || 'localhost';
            console.log(`APP URL is: http://${hostname}:${port}`);
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


