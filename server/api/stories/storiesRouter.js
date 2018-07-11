const express = require('express');

const StoriesModel = require('./storyModel');
const BlockModel = require('../blocks/blockModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;

const router = express.Router();

const LIMIT = 10;

// // // // POST
async function createStory(req, res) {
    const record = await StoriesModel.create({
        date: new Date(),
        title: req.body.title || 'Untitled Story',
        image: req.body.image,
        content: req.body.content,
        public: req.body.public
    })
    res.json({
        story: record.serialize()
    });
}

async function createStoryInBlock(req, res) {
    const record = await StoriesModel.create({
        date: new Date(),
        title: req.body.title || 'Untitled Story',
        image: req.body.image,
        content: req.body.content,
        public: req.body.public
    })

    BlockModel
        .findOne({id: req.params.id})
        .populate('stories', record.id)
        .exec(function (err, story) {
            if (err) return handleError(err);
        });
}

router.post('/story/create', tryCatch(createStory));

router.post('/story/create/:id', tryCatch(createStoryInBlock));

// // // // GET
async function getStories(req, res) {
    const offset = parseInt(req.params.offset || 0);
    const total = await StoriesModel.countDocuments()

    if (offset > total || offset < 0) {
        throw new Error('OUT_OF_BOUNDS');
    }

    const records = await StoriesModel
        .find({})
        .sort([
            ['date', -1]
        ])
        .skip(offset)
        .limit(LIMIT)

    res.json({
        pageSize: LIMIT,
        total,
        stories: records.map(record => record.serialize())
    })
}

router.get('/storiesall', tryCatch(getStories));

router.get('/storiesall/:offset', tryCatch(getStories));


// // // // PUT
async function updateStory(req, res) {

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

    const record = await StoriesModel
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
    res.json({
        story: record.serialize()
    });
}

router.put('/story/update/:id', tryCatch(updateStory));

// // // // DELETE
async function deleteStory(req, res) {
    const record = await StoriesModel
        .findByIdAndRemove(req.params.id)
    res.status(204).end()
}

router.delete('/story/delete/:id', tryCatch(deleteStory));

module.exports = router;