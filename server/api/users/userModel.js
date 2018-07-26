'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsersSchema = new mongoose.Schema({
    email: {
        unique: true,
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


const email = 'test@test.com';
const password = 'password123';

const testUtilCreateUser = async () => {
    await UserModel.remove({})
    return UserModel.hashPassword(password).then(hashedPassword => {
        return UserModel.create({
            email,
            password: hashedPassword
        })
    })
}

module.exports = {
    UserModel,
    testUtilCreateUser
};

