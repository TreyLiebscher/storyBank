const API_URLS = {
    //Blocks
    createBlock: '/storyblock/block/create',
    getBlocks: '/storyblock/blocks',
    getUserBlocks: '/storyblock/myblocks',
    deleteBlock: '/storyblock/block/delete', //NOTE: need to append block id
    updateBlock: '/storyblock/block/update',
    //Stories
    createStory: '/stories/story/create', //NOTE: need to append  block id
    getBlocksWithStories: '/storyblock/blocks/stories',
    getStoryById: '/stories/story', //NOTE: need to append story id
    deleteStory: '/stories/story/delete', //NOTE: need to append story id
    updateStory: '/stories/story/update', //NOTE: need to append story id
    getPublicStories: '/stories/storiesall',
    //Users
    createNewUser: '/users/user/createUser',
    userLogIn: '/users/login',
    changePassword: '/users/changepassword'
}

//In case of Errors
$(document).ajaxError(function (err) {
    console.error(err)
    displayErrorMessage();
});

function renderErrorMessage() {
    return `
        <div class="userMessages">
        <p class="errorMessage">Something went wrong, please try again</p>
        <button id="cancelBlockDeletion" class="userButton" type="button">Ok</button>
        </div>
    `
}

function displayErrorMessage() {
    const message = renderErrorMessage();
    $('.deleteMenuHolder').removeClass('hide');
    $('.deleteMenuHolder').html(message);
}

// Loading Icon
$(document)
    .ajaxStart(function () {
        $('.titleBox').addClass('blockLoader')
        $('.storyBankTitle').addClass('storyBankTitleFontColor')
    })
    .ajaxStop(function () {
        $('.titleBox').removeClass('blockLoader')
        $('.storyBankTitle').removeClass('storyBankTitleFontColor')
    });

//Handles any form submission on page
function handleFormsSubmit() {

    $('body').submit(function (event) {
        event.preventDefault();

        const formID = $(event.target).attr('id')
        console.log('Submitted form id is:', formID)

        //Blocks
        if (formID === 'createBlock') {
            handleCreateBlockSubmit()
        }
        if (formID === 'editBlock') {
            handleBlockUpdate()
        }
        if (formID === 'deleteBlock') {
            handleBlockDeletion()
        }
        //Stories
        if (formID === 'createStory') {
            handleCreateStory()
        }
        if (formID === 'editStory') {
            handleStoryUpdate();
        }
        if (formID === 'deleteStory') {
            handleStoryDeletion();
        }
        //Users
        if (formID === 'signUpForm') {
            handleCreateNewUser();
        }
        if (formID === 'logInForm') {
            handleUserLogIn();
        }
        if (formID === 'changePassword') {
            handleChangePassword();
        }
    });
}

function renderMessages(message) {
    return `
    <div class="userMessages">
        <p>${message}</p>
        <button id="cancelBlockDeletion" class="userButton" type="button">Ok</button>
    </div>
    `;
}

$(handleFormsSubmit);