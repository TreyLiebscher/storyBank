const express = require('express');

const BlockModel = require('./blockModel');
const StoriesModel = require('../stories/storyModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;

const passport = require('passport');
const { localStrategy, jwtStrategy } = require('../../../auth/strategies');
passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });


const router = express.Router();

const LIMIT = 10;

const BLOCK_MODEL_FIELDS = ['title', 'color'] //an array of updatable field names

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

// // // // POST
async function createBlock(req, res) {
    const record = await BlockModel.create({
        // jwtAuth will set req.user to the logged in user
        // populate user_id with the logged in user's id
        user_id:req.user.id,         
        date: new Date(),
        title: req.body.title || 'Untitled Story',
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
        return res.status(400).json({message: 'OUT_OF_BOUNDS'});
    }

    const records = await BlockModel
        .find({user_id: req.user.id})
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

// // // // GET
async function getBlocks(req, res) {
    const offset = parseInt(req.params.offset || 0);
    const total = await BlockModel.countDocuments()

    if (offset > total || offset < 0) {
        return res.status(400).json({message: 'OUT_OF_BOUNDS'});
    }

    const records = await BlockModel
        .find({})
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

router.get('/blocks', tryCatch(getBlocks));

router.get('/blocks/:offset', tryCatch(getBlocks));

// // // // GET by id
async function getBlock(req, res) {
    const record = await BlockModel.findById(req.params.id)
    if (record === null) {
        return res.status(404).json({ message: 'NOT_FOUND' })
    }
    res.json({ block: record.serialize() })
}

router.get('/block/:id', tryCatch(getBlock));

async function getBlockWithStories(req, res) {
    const record = await BlockModel.findById(req.params.id);
    if (record === null) {
        return res.status(404).json({message: 'NOT_FOUND'})
    }

    const storyRecordArr = await StoriesModel.find({block: req.params.id});
    if (record === null) {
        return res.status(404).json({message: 'No stories in this block'})
    }
    res.json({block: record.serialize(), stories: storyRecordArr.map(record=>record.serialize())});
}

router.get('/blocks/stories/:id', tryCatch(getBlockWithStories));

// // // // PUT
async function updateBlock(req, res) {
    const existingRecord = await BlockModel.findById(req.params.id)
    if (existingRecord === null) {
        return res.status(404).json({ message: 'NOT_FOUND' })
    }
    const newFieldValues = getFieldsFromRequest(BLOCK_MODEL_FIELDS, req)

    const updatedRecord = await BlockModel.findByIdAndUpdate(
        { '_id': req.params.id },
        { $set: newFieldValues },
        { new: true } 
    )
    res.json({ block: updatedRecord.serialize() })
}

router.put('/block/update/:id', tryCatch(updateBlock));

// // // // DELETE
async function deleteBlock(req, res) {
    const record = await BlockModel.findByIdAndRemove(req.params.id)
    if (record === null) {
        return res.status(404).json({ message: 'NOT_FOUND' })
    }
    res.json({ block: record.serialize() })
}

// Delete
router.delete('/block/delete/:id', tryCatch(deleteBlock));

module.exports = router;