const mongoose = require('mongoose');


const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const storySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    public: {
        type: Boolean,
        required: true
    },
    publishDate: {
        type: String,
        required: true
    },
    storyBlock: [{
        type: mongoose.Schema.ObjectId,
        ref: 'storyblocks'
    }]
}, {collection: 'stories'});

storySchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        image: this.image,
        content: this.content,
        publishDate: this.publishDate,
        public: this.public
    };
};


const storyBlockSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    story: [{
        type: mongoose.Schema.ObjectId,
        ref: 'stories'
    }]
}, {collection: 'storyblocks'});

storyBlockSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        color: this.color
    };
};


const Story = mongoose.model('stories', storySchema);
const StoryBlock = mongoose.model('storyblocks', storyBlockSchema);

module.exports = {
    Story,
    StoryBlock
};