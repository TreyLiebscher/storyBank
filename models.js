const uuid = require('uuid');


function StorageException(message) {
    this.message = message;
    this.name = "StorageException";
}

const Story = {
    create: function (title, content, image) {
        console.log('Creating new story post');
        const item = {
            title: title,
            image: image,
            id: uuid.v4(),
            publishDate: new Date().toString(),
            content: content
        };
        this.items[item.id] = item;
        return item;
    },
    get: function () {
        console.log('Retrieving story');
        return Object.keys(this.items).map(key => this.items[key]);
    },
    delete: function (id) {
        console.log(`Deleting story \`${id}\``);
        delete this.items[id];
    },
    update: function (updatedItem) {
        console.log(`Deleting story \`${updatedItem.id}\``);
        const {
            id
        } = updatedItem;
        if (!(id in this.items)) {
            throw StorageException(
                `Can't update story \`${id}\` because doesn't exist.`)
        }
        this.items[updatedItem.id] = updatedItem;
        return updatedItem;
    }
};

function createStory() {
    const storage = Object.create(Story);
    storage.items = {};
    return storage;
}

module.exports = {
    Story: createStory()
}