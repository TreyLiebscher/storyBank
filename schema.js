const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// var personSchema = Schema({
//   _id: Schema.Types.ObjectId,
//   name: String,
//   age: Number,
//   stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
// });

const storySchema = Schema({
    _id: Schema.Types.ObjectId,
    title: String,
    image: String,
    content: String,
    publishDate: String,
    public: Boolean,
    storyBlock : {type: Schema.Types.ObjectId, ref: 'StoryBlock'}
}, {collection: 'stories'});

storySchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        image: this.image,
        content: this.content,
        publishDate: this.publishDate,
        public: this.public,
        storyBlock: this.storyBlock
    };
};


const storyBlockSchema = Schema({
    title: String,
    color: String,
    stories: [storySchema]
}, {collection: 'storyblocks'});

storyBlockSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        color: this.color,
        stories: this.stories
    };
};



// var storySchema = Schema({
//   author: { type: Schema.Types.ObjectId, ref: 'Person' },
//   title: String,
//   fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
// });

var Story = mongoose.model('stories', storySchema);
var StoryBlock = mongoose.model('storyblocks', storyBlockSchema);

module.exports = {
    Story,
    StoryBlock
};