'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {UserModel} = require('../users/userModel');
const config = require('../config');
const router = express.Router();

const createAuthToken = function(user) {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.email,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', {session: false, failWithError: false});

router.use(bodyParser.json());

router.post('/login', localAuth, (req, res) => {
    console.log('Login attempt successful', req.email, req.password, req.user)

    const authToken = createAuthToken(req.user.serialize());
    const email = req.user.serialize().email;
    res.json({authToken, emailAddress});
});

const jwtAuth = passport.authenticate('jwt', {session: false});


async function changePassword(req, res) {
    const requiredFields = ['newPassword', 'retypeNewPassword'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(404).send(message);
        }
    }

    const userPassword = await UserModel.hashPassword(req.body.password);

    const userRecord = await UserModel.findByIdAndUpdate(req.user.id, {password:userPassword});

    res.json({
        user: userRecord.serialize()
    })
}

router.post('/changepassword', jwtAuth, tryCatch(changePassword));

router.post('/refresh-auth-token', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({authToken});
});

module.exports = router;
