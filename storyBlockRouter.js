const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {StoryBlock} = require('./models');

router.get('/', (req, res) => {
    StoryBlock
        .find()
        .then(storyblocks => {
            res.json({
                storyblocks: storyblocks.map(
                    (storyblock) => storyblock.serialize()
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

router.post('/', (req, res) => {
    const requiredFields = ['title', 'color'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    StoryBlock
        .create({
            title: req.body.title,
            color: req.body.color
        })
        .then(storyblock => res.status(201).json(storyblock.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
});

module.exports = router;