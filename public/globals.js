const API_URLS = {
    createBlock: '/storyblock/block/create',
    getBlocks: '/storyblock/blocks',
    getUserBlocks: '/storyblock/myblocks',
    deleteBlock: '/storyblock/block/delete', //NOTE: need to append block id
    updateBlock: '/storyblock/block/update',
    createStory: '/stories/story/create', //NOTE: need to append  block id
    getBlocksWithStories: '/storyblock/blocks/stories',
    getStoryById: '/stories/story', //NOTE: need to append story id
    deleteStory: '/stories/story/delete', //NOTE: need to append story id
    updateStory: '/stories/story/update', //NOTE: need to append story id
    createNewUser: '/users/user/createUser',
    userLogIn: '/users/login'
}

function renderErrorMessage() {
    return `
        <p class="errorMessage">Something went wrong, please try again</p>
        <button id="cancelBlockDeletion" class="userButton" type="button">Ok</button>
    `
}

function displayErrorMessage() {
    const message = renderErrorMessage();
    $('.deleteMenuHolder').removeClass('hide');
    $('.deleteMenuHolder').html(message);
}

$(document).ajaxError(function (err) {
    console.error(err)
    displayErrorMessage();
});