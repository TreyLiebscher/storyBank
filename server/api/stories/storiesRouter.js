const express = require('express');

const StoriesModel = require('./storyModel');
const BlockModel = require('../blocks/blockModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;

const passport = require('passport');
const {
    localStrategy,
    jwtStrategy
} = require('../../../auth/strategies');
passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', {
    session: false
});

const router = express.Router();

const LIMIT = 10;

const STORY_MODEL_FIELDS = ['title', 'image', 'content', 'publicStatus'] //an array of updatable field names

function getFieldsFromRequest(fieldNamesArr, req) {
    const requestFieldNames = Object.keys(req.body)

    // new to reduce? 
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce    
    return fieldNamesArr.reduce((acc, fieldName) => {

        if (requestFieldNames.includes(fieldName)) { // is this field name present in the request?
            const value = req.body[fieldName]

            // is there an usable value? 
            // if so, add it to the reduce() return object
            if (value !== undefined) {
                acc[fieldName] = value
            }
        }
        return acc
    }, {})
}

async function createStoryInBlock(req, res) {

    const blockRecord = await BlockModel.findOne({
        _id: req.params.id
    });

    //this validates block _id
    if (blockRecord === null) {
        throw new Error('Block does not exist');
    }

    const record = await StoriesModel.create({
        date: new Date(),
        title: req.body.title || 'Untitled Story',
        image: req.body.image,
        content: req.body.content,
        publicStatus: req.body.publicStatus,
        block: blockRecord._id
    })

    res.json({
        story: record.serialize()
    });
}

router.post('/story/create/:id', jwtAuth, tryCatch(createStoryInBlock));

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

// // // // GET by id

async function getStory(req, res) {
    const record = await StoriesModel.findById(req.params.id)
    if (record === null) {
        return res.status(404).json({
            message: 'Not Found'
        });
    }
    res.json({
        story: record.serialize()
    })
}

router.get('/story/:id', tryCatch(getStory));


// // // // PUT
async function updateStory(req, res) {

    const existingRecord = await StoriesModel.findById(req.params.id);
    if (existingRecord === null) {
        return res.status(404).json({
            message: 'NOT_FOUND'
        })
    }
    const newFieldValues = getFieldsFromRequest(STORY_MODEL_FIELDS, req);

    const updatedRecord = await StoriesModel.findByIdAndUpdate({
        '_id': req.params.id
    }, {
        $set: newFieldValues
    }, {
        new: true
    })
    res.json({
        story: updatedRecord.serialize()
    })
}

router.put('/story/update/:id', tryCatch(updateStory));

// // // // DELETE
async function deleteStory(req, res) {
    const record = await StoriesModel
        .findByIdAndRemove(req.params.id)
    if (record === null) {
        return res.status(404).json({
            message: 'NOT_FOUND'
        })
    }
    res.json({
        story: record.serialize(),
        message: 'Story has been deleted'
    })
}

router.delete('/story/delete/:id', jwtAuth, tryCatch(deleteStory));

module.exports = router;