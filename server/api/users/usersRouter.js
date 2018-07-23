const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jsonParser = bodyParser.json();

const {UserModel} = require('./userModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;
const router = express.Router();

//user signup (create new user)

async function createNewUser(req, res) {
    const requiredFields = ['email', 'password'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message)
        }
    }
    
    const userPassword = await UserModel.hashPassword(req.body.password);

    const userRecord = await UserModel.create({
        email: req.body.email,
        password: userPassword
    });

    res.json({
        user: userRecord.serialize()
    })
}

router.post('/user/createUser', tryCatch(createNewUser));

module.exports = router;
