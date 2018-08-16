'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    stories: [{
        type: Schema.Types.ObjectId,
        ref: 'storiesmodel'
    }],
    user_id: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'UserModel'
    }

}, {
        timestamps: {
            createdAt: 'createdAt'
        }
    });

BlockSchema.methods.getStories = function () {
    const StoriesModel = require('../stories/storyModel')
    return StoriesModel
        .find({
            block: this._id
        })
        .select('-image')
}

BlockSchema.methods.serialize = function () {

    return {
        id: this._id,
        title: this.title,
        color: this.color,
        createdAt: this.createdAt,
        // stories: this.stories.map(record=>record.serialize())
    };
}

const BlockModel = mongoose.model('BlockModel', BlockSchema);

module.exports = BlockModel