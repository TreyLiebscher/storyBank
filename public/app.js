'use strict';

// http://treys-imac.local:8080/

function getBlocks(id, callback) {
    const requestURI = `http://treys-imac.local:8080/storyblock/block/${id}`;
    $.getJSON(requestURI, callback);
}

function getAllBlocks(callback) {
    const requestURI = `http://treys-imac.local:8080/storyblock/blocks`;
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
        <h3>${result.title}</h3>        
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
    $('#logIn').on('click', function(event) {
        event.preventDefault();
        const logIn = renderLogInForm();
        $('#formsHolder').html(logIn);
        componentHandler.upgradeDom();
    });
}

//POST - StoryBlock
function createBlock(){
    $('#createBlock').submit(function (event) {
        event.preventDefault();

        const $form = $(this),
            title = $form.find('input[name="title"]').val(),
            color = $form.find('input[name="color"]').val(),
            url = $form.attr('action');

        const posting = $.post(url, {title: title, color: color});

        posting.done(function(data) {
            const content = renderBlock(data.block);
            $('.js-block-result').append(content);
        });
    });
}

function handleGetAllBlocks(){
    $('.js-all-block-display').on('click', function(event) {
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



function storyBank() {
    $(watchBlockSearchSubmit);
    // $(handleBlockSubmit);
    $(createBlock);
    $(handleGetAllBlocks);
    $(handleSignUpClick);
    $(handleLogInClick);
}

$(storyBank);