const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {StoryBlock} = require('./schema');//changed from models

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

router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`
        );
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['title', 'color'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    StoryBlock
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(storyblock => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

router.delete('/:id', (req, res) => {
    StoryBlock
        .findByIdAndRemove(req.params.id)
        .then(storyblock => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

router.use('*', (req, res) => {
    res.status(404).json({message: 'Not Found'});
});

module.exports = router;