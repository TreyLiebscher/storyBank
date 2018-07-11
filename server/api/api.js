const StoriesModel = require('./stories/storyModel');
const storiesRouter = require('./stories/storiesRouter');

const BlockModel = require('./blocks/blockModel');
const blockRouter = require('./blocks/blockRouter');

const UserModel = require('./users/UserModel');
const usersRouter = require('./users/usersRouter');


const apiConfig = {
    stories: {
        router: storiesRouter,
        models: {
            story: StoriesModel
        }
    },
    storyblock: {
        router: blockRouter,
        models: {
            block: BlockModel
        }
    },
    users: {
        router: usersRouter,
        models: {
            users: UserModel
        }
    },
}

function setupRoutes(app) {
    const prefixes = Object.keys(apiConfig);
    prefixes.forEach(prefix => {
        console.log(`SETUP /${prefix} ROUTE PREFIX`);
        const router = apiConfig[prefix].router;
        app.use(`/${prefix}`, router);

    });
}

function getConfig(prefix) {
    return apiConfig[prefix];
}

module.exports = {
    getConfig,
    setupRoutes
}