'use strict';

const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

mongoose.Promise = global.Promise;
// app.use(fileUpload());

const {
    PORT,
    DATABASE_URL
} = require('./config');

const {
    Story
} = require('./models');

const app = express();
app.use(express.json());

app.get('/stories', (req, res) => {
    Story
        .find()
        .then(stories => {
            res.json({
                stories: stories.map(
                    (story) => story.serialize()
                )
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});

app.get('/stories/:id', (req, res) => {
    Story
        .findById(req.params.id)
        .then(story => res.json(story.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});

app.post('/stories', (req, res) => {
    const requiredFields = ['title', 'content', 'public'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Story
        .create({
            title: req.body.title,
            content: req.body.content,
            public: req.body.public
        })
        .then(story => res.status(201).json(story.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
});

app.put('/stories/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`
        );
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['title', 'image', 'content', 'public'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Story
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(story => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.delete('/stories/:id', (req, res) => {
    Story
        .findByIdAndRemove(req.params.id)
        .then(story => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.use('*', function (req, res) {
    res.status(404).json({message:'Not Found'});
});

// // // // // // // // // // // // // // // // // // //
let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}


function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}


if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};