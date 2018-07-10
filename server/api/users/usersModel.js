'use strict';

const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

}, {
        timestamps: {
            createdAt: 'createdAt'
        }
    });

UsersSchema.methods.serialize = function () {

    return {
        email:this.email,
        password:'HIDDEN',
    };
}

const UsersModel = mongoose.model('UsersModel', UsersSchema);

module.exports = UsersModel