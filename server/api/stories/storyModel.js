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
        required: false
    },
    imageHash: {
        type: String,
        required: false
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

StoriesSchema.methods.serialize = function (includeImageData = true) {
    const retObj = {
        id: this._id,
        title: this.title,
        imageURL: !this.image ? null : `/stories/story/image/${this.id}/${this.imageHash}`,
        content: this.content,
        publicStatus: this.publicStatus,
        createdAt: this.createdAt,
        block: this.block
    };
    if (includeImageData) {
        retObj.image = this.image
    }
    return retObj
}



function computeImageHash (imageData) {
    if (imageData) {
        return require('crypto').createHash('sha1').update(imageData).digest('hex');
    }
    return null
}

const StoriesModel = mongoose.model('StoriesModel', StoriesSchema);
StoriesModel.computeImageHash = computeImageHash

module.exports = StoriesModel