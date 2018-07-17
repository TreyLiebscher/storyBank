'use strict';

const BASE_URL = '/'
const API_URLS = {
    createBlock: '/storyblock/block/create',
    createStory: '/stories/story/create' //NOTE: need to append  block id
}


// http://localhost:8080/

function getBlocks(id, callback) {
    const requestURI = `http://localhost:8080/storyblock/block/${id}`;
    $.getJSON(requestURI, callback);
}

function getAllBlocks(callback) {
    const requestURI = `http://localhost:8080/storyblock/blocks`;
    return $.getJSON(requestURI, callback)
}



function watchBlockSearchSubmit() {
    $('.js-block-search-form').on('submit', function (event) {
        event.preventDefault();
        const id = $('.js-query-id').val();
        getBlocks(id, displayBlock);
    });
}

function renderBlock(result) {
    return `
    <div class="storyBlock" id="${result.id}" style="background-color:${result.color}">
        <p class="blockTitle">${result.title}</p>
        <p class="blockId">${result.id}</p>
        <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored addStory" type="button">
		<i class="material-icons">add</i>
	</button>
    </div>`
}

function displayBlock(arr) {
    const results = arr.blocks.map((item) => renderBlock(item));
    $('.js-block-result').html(results);
}

function renderSignUpForm() {
    return `<form class="js-signUp-form" type="submit">
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="userName" class="mdl-textfield__input">
		<label class="mdl-textfield__label" for="userName">Username</label>
	</div>
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="password" class="mdl-textfield__input" type="password">
		<label class="mdl-textfield__label" for="password">Password</label>
	</div>
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="passwordConfirm" class="mdl-textfield__input" type="password">
		<label class="mdl-textfield__label" for="passwordConfirm">Confirm Password</label>
	</div>
	<button type="submit">Create Account</button>
    </form>`
}

function handleSignUpClick() {
    $('#signUp').on('click', function (event) {
        event.preventDefault();
        const signUp = renderSignUpForm();
        $('#formsHolder').html(signUp);
        componentHandler.upgradeDom();
    });
}

function renderLogInForm() {
    return `<form class="js-logIn-form" type="submit">
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="userName" class="mdl-textfield__input">
		<label class="mdl-textfield__label" for="userName">Username</label>
	</div>
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="password" class="mdl-textfield__input" type="password">
		<label class="mdl-textfield__label" for="password">Password</label>
	</div>
	<button type="submit">Log In</button>
    </form>
    `
}

function handleLogInClick() {
    $('#logIn').on('click', function (event) {
        event.preventDefault();
        const logIn = renderLogInForm();
        $('#formsHolder').html(logIn);
        componentHandler.upgradeDom();
    });
}


function handleCreateBlockSubmit() {

    const $form = $('#createBlock'),
        title = $form.find('input[name="title"]').val(),
        color = $form.find('input[name="color"]').val(),
        url = $form.attr('action');

    const posting = $.post(url, {
        title: title,
        color: color
    });

    posting.done(function (data) {
        const content = renderBlock(data.block);
        $('.js-block-result').append(content);
    });

}

function handleGetAllBlocks() {
    $('.js-all-block-display').on('click', function (event) {
        event.preventDefault();
        const blockPromise = getAllBlocks();

        blockPromise.catch(err => {
            console.error('Error', err);
        })

        blockPromise.then(blockResponse => {
            return displayBlock(blockResponse);
        })
    });
}




function renderCreateStoryInterface(title, id) {

    const createURL = API_URLS.createStory

    return `		<h3>Add a story to ${title}</h3>
    <form id="createStory" action="${createURL}/${id}" method="POST">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="title" class="mdl-textfield__input" name="title">
            <label class="mdl-textfield__label" for="title">Title</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
            <input id="image" class="mdl-textfield__input" name="image">
            <label class="mdl-textfield__label" for="image">Image</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <textarea class="mdl-textfield__input" type="text" rows="3" id="content" name="content"></textarea>
            <label class="mdl-textfield__label" for="content">Write your story</label>
        </div>
        <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="switch-2">
            <input type="checkbox" id="switch-2" class="mdl-switch__input" name="publicStatus">
            <span class="mdl-switch__label">publicStatus?</span>
        </label>
        <button type="submit">Add to block</button>
    </form>`
}

function viewCreateStoryInterface() {
    $('.js-block-result').on('click', 'button.addStory', function (event) {
        event.preventDefault();
        const blockTitle = $(event.target).closest('.storyBlock').find('.blockTitle').text();
        console.log(blockTitle);//for testing needs removal
        const blockId = $(event.target).closest('.storyBlock').find('.blockId').text();
        console.log(blockId);//for testing needs removal
        const createStoryInterface = renderCreateStoryInterface(blockTitle, blockId);
        $('.storyCreateInterface').html(createStoryInterface);
        componentHandler.upgradeDom();
    });
}

function renderStory(result) {
    return `
        <h3>${result.title}</h3>
        <img src="${result.image}">
        <p>${result.content}</p>
    `
}


function handleCreateStory() {
    const $form = $('#createStory'),
        title = $form.find('input[name="title"]').val(),
        image = $form.find('input[name="image"]').val(),
        content = $form.find('textarea[name="content"]').val();

    const ckBox = $form.find("#switch-2")
    const publicStatus = ckBox.is(':checked')
    const url = $form.attr('action');

    const formData = {
        title: title,
        image: image,
        content: content,
        publicStatus: publicStatus
    }

    const posting = $.post(url, formData);

    posting.done(function (data) {
        const content = renderStory(data.story);
        $('.js-story-result').append(content);
    });
}

function handleFormsSubmit() {

    $('body').submit(function (event) {
        event.preventDefault();

        const formID = $(event.target).attr('id')
        console.log('Submitted form id is:', formID)

        if (formID === 'createBlock') {
            //create block logic here
            handleCreateBlockSubmit()
        }

        if (formID === 'createStory') {
            //create story logic here
            handleCreateStory()
        }

    });
}



function storyBank() {
    $(watchBlockSearchSubmit);
    // $(handleBlockSubmit);
    $(createBlock);
    $(handleGetAllBlocks);
    $(handleSignUpClick);
    $(handleLogInClick);
    $(viewCreateStoryInterface);
    $(handleFormsSubmit);
}

$(storyBank);