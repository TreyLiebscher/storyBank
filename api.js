const StoriesModel = require('./models');
const storiesRouter = require('./storiesRouter');

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