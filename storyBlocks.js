const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {
    StoryBlock
} = require('./models');



router.get('/', (req, res) => {
    res.json(StoryBlock.get());
});

module.exports = router;

