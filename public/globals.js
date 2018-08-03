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
    //Users
    createNewUser: '/users/user/createUser',
    userLogIn: '/users/login'
}

//In case of Errors
$(document).ajaxError(function (err) {
    console.error(err)
    displayErrorMessage();
});

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

//Loading Icon
$(document)
    .ajaxStart(function () {
        $('.loadingHolder').show();
    })
    .ajaxStop(function () {
        $('.loadingHolder').hide();
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
        if (formID === 'deleteBlock') {
            handleBlockDeletion()
        }
        if (formID === 'editBlock') {
            handleBlockUpdate()
        }
        //Stories
        if (formID === 'createStory') {
            handleCreateStory()
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
    });
}

$(handleFormsSubmit);