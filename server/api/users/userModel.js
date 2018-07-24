'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsersSchema = new mongoose.Schema({
    email: {
        unique:true,
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
        id: this._id,
        email: this.email
    };
}

UsersSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

UsersSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
}

const UserModel = mongoose.model('UserModel', UsersSchema);

module.exports = {UserModel};