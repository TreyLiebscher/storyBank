'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    publicStatus: {
        type: Boolean,
        required: true
    },
    block: {
        type: Schema.Types.ObjectId,
        ref: 'blockmodel'
    }
}, {
    timestamps: {
        createdAt: 'createdAt'
    }
});

StoriesSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        image: this.image,
        content: this.content,
        publicStatus: this.publicStatus,
        createdAt: this.createdAt,
        block: this.block
    };
}

const StoriesModel = mongoose.model('StoriesModel', StoriesSchema);

module.exports = StoriesModel