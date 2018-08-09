const express = require('express');

const BlockModel = require('./blockModel');
const StoriesModel = require('../stories/storyModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;
const getFields = require('../../helpers').getFieldsFromRequest;

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

const LIMIT = 1000;

const BLOCK_MODEL_FIELDS = ['title', 'color'] //an array of updatable field names

// // // // POST
async function createBlock(req, res) {
    const record = await BlockModel.create({
        // jwtAuth will set req.user to the logged in user
        // populate user_id with the logged in user's id
        user_id: req.user.id,
        date: new Date(),
        title: req.body.title || 'Untitled Block',
        color: req.body.color
    })
    res.json({
        block: record.serialize()
    });
}

router.post('/block/create', jwtAuth, tryCatch(createBlock));

// // // // GET blocks associated with user
async function getUserBlocks(req, res) {
    const offset = parseInt(req.params.offset || 0);
    const total = await BlockModel.countDocuments()

    if (offset > total || offset < 0) {
        return res.status(400).json({
            message: 'OUT_OF_BOUNDS'
        });
    }

    const records = await BlockModel
        .find({
            user_id: req.user.id
        })
        .sort([
            ['date', -1]
        ])
        .skip(offset)
        .limit(LIMIT)

    res.json({
        pageSize: LIMIT,
        total,
        blocks: records.map(record => record.serialize())
    })
}

router.get('/myblocks', jwtAuth, tryCatch(getUserBlocks));

router.get('/myblocks/:offset', jwtAuth, tryCatch(getUserBlocks));

// // // // GET by id
async function getBlock(req, res) {
    const record = await BlockModel.findById(req.params.id)
    if (record === null) {
        return res.status(404).json({
            message: 'NOT_FOUND'
        })
    }
    res.json({
        block: record.serialize()
    })
}

router.get('/block/:id', jwtAuth, tryCatch(getBlock));

async function getBlockWithStories(req, res) {
    const record = await BlockModel.findById(req.params.id);
    if (record === null) {
        return res.status(404).json({
            message: 'NOT_FOUND'
        })
    }

    const storyRecordArr = await StoriesModel.find({
        block: req.params.id
    });

    res.json({
        block: record.serialize(),
        stories: storyRecordArr.map(record => record.serialize())
    });
}

router.get('/blocks/stories/:id', jwtAuth, tryCatch(getBlockWithStories));

// // // // PUT
async function updateBlock(req, res) {
    const existingRecord = await BlockModel.findById(req.params.id)
    if (existingRecord === null) {
        return res.status(404).json({
            message: 'NOT_FOUND'
        })
    }
    const newFieldValues = getFields(BLOCK_MODEL_FIELDS, req)

    const updatedRecord = await BlockModel.findByIdAndUpdate({
        '_id': req.params.id
    }, {
        $set: newFieldValues
    }, {
        new: true
    })
    res.json({
        block: updatedRecord.serialize(),
        message: 'Block updated successfully'
    })
}

router.put('/block/update/:id', jwtAuth, tryCatch(updateBlock));

// // // // DELETE
async function deleteBlock(req, res) {
    const record = await BlockModel.findByIdAndRemove(req.params.id)
    if (record === null) {
        return res.status(404).json({
            message: 'NOT_FOUND'
        })
    }

    const storiesRecord = await StoriesModel
        .find({
            block: req.params.id
        })
        .remove()
    //TODO decide whether or not this is even necessary
    // if (storiesRecord === null) {
    //     return res.status(404).json({
    //         message: 'NOT_FOUND'
    //     })
    // }

    res.json({
        block: record.serialize(),
        // stories: storiesRecord.map(record => record.serialize()), //TODO make this work
        message: `"${record.title}" has been deleted`
    });
}

router.delete('/block/delete/:id', jwtAuth, tryCatch(deleteBlock));

module.exports = router;