const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

mongoose.Promise = global.Promise;

const {
    Story
} = require('./models');

const { PORT, DATABASE_URL} = require('./config');

router.get('/stories', (req, res) => {
    res.json(Story.get());
});


router.get('/:id', (req, res) => {
    Story
        .findById(req.params.id)
        .then(story => res.json(Story.get()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});



router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'image'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        };
    }
    const item = Story.create(req.body.title, req.body.content, req.body.image);
    res.status(201).json(item);
});

// for image uploading (not implemented yet)
router.post('/upload', function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('/somewhere/on/your/server/filename.jpg', function (err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });
});
// 





router.delete('/:id', (req, res) => {
    Story.delete(req.params.id);
    console.log(`Deleted blog post \'${req.params.id}\'`)
    res.status(204).end();
});

router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'id'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }
    if (req.params.id !== req.body.id) {
        const message = `Request path id \`${req.params.id}\` and request body id \`${req.body.id}\` must match`
        console.error(message);
        return res.status(400).send(message);
    }
    console.log(`Updating story \`${req.params.id}\``);
    const updatedStory = Story.update({
        id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        publishedDate: new Date().toString()
    });
    res.status(204).end();
});


module.exports = router;