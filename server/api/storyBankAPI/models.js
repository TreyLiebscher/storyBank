'use strict';

const mongoose = require('mongoose');

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
    public: {
        type: Boolean,
        required: true
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
        public: this.public,
        createdAt: this.createdAt
    };
}

const StoriesModel = mongoose.model('StoriesModel', StoriesSchema);

module.exports = StoriesModel