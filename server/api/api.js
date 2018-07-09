const StoriesModel = require('./storyBankAPI/models');
const storiesRouter = require('./storyBankAPI/storiesRouter');

// const { setupRoutes } = require('./api/api.js');

const apiConfig = {
    storyBank: {
        router: storiesRouter,
        models: {
            story: StoriesModel
        }
    }
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