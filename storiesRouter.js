const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {
    Story
} = require('./models');

const {
    StoryBlock
} = require('./models');

router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
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

// // // // // // // //
router.post('/', (req, res) => {
    const requiredFields = ['title', 'content', 'public', 'storyBlock'];
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
                image: req.body.image,
                public: req.body.public,
                publishDate: new Date().toString(),
                storyBlock: req.body.storyBlock
            }
        )
        .then(story => res.status(201).json(story.serialize()))
        // .then(function (err, story) {
        //     StoryBlock.findByIdAndUpdate({
        //         id: req.body.storyBlock
        //     }, {
        //         $push: {
        //             stories: req.body.id
        //         }
        //     }, function(err, storyBlock) {});
        // })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});

// // // // // //

router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`
        );
        console.error(message);
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'image', 'content', 'public'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Story
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(story => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal Server Error'
        }));
});

router.delete('/:id', (req, res) => {
    Story
        .findByIdAndRemove(req.params.id)
        .then(story => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal Server Error'
        }));
});

router.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

module.exports = router;