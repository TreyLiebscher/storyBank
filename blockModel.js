'use strict';

const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },

}, {
    timestamps: {
        createdAt: 'createdAt'
    }
});

BlockSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        color: this.color,
        createdAt: this.createdAt
    };
}

const BlockModel = mongoose.model('BlockModel', BlockSchema);

module.exports = BlockModel