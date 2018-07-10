const express = require('express');

const UserModel = require('./UserModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;

const router = express.Router();

// // // // GET
async function getUsers(req, res) {
    const total = await UserModel.countDocuments()
    const records = await UserModel
        .find({})
        .sort([
            ['email', -1]
        ])        
        

    res.json({        
        total,
        users: records.map(record => record.serialize())
    })
}

router.get('/', tryCatch(getUsers));

//JWT login = authentication

module.exports = router;
