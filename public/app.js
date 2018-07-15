'use strict';

// http://treys-imac.local:8080/

function getBlocks(id, callback) {
    const requestURI = `http://treys-imac.local:8080/storyblock/block/${id}`;
    $.getJSON(requestURI, callback);
}

function displayBlock(data) {
    const results = `
    <div class="storyBlock" style="background-color:${data.color}">
        <h3>${data.title}</h3>        
    </div>`;
    $('.js-block-result').html(results);
}

function watchBlockSearchSubmit() {
    $('.js-block-search-form').on('submit', function (event) {
        event.preventDefault();
        const id = $('.js-query-id').val();
        getBlocks(id, displayBlock);
    });
}

function renderBlock(title, color) {
    return `
    <div class="storyBlock" style="background-color:${color}">
        <h3>${title}</h3>        
    </div>`
}

function handleBlockSubmit() {
    $('#createBlock').on('submit', function (event) {
        event.preventDefault();
        const title = $('#title').val();
        const color = $('#color').val();
        const block = renderBlock(title, color);
        $('.blockHolder').append(block);
    });
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

function handleSignUpClick() {
    $('#signUp').on('click', function (event) {
        event.preventDefault();
        const signUp = renderSignUpForm();
        $('#formsHolder').html(signUp);
        componentHandler.upgradeDom();
    });
}

function handleLogInClick() {
    $('#logIn').on('click', function(event) {
        event.preventDefault();
        const logIn = renderLogInForm();
        $('#formsHolder').html(logIn);
        componentHandler.upgradeDom();
    });
}



function storyBank() {
    $(watchBlockSearchSubmit);
    $(handleBlockSubmit);
    $(handleSignUpClick);
    $(handleLogInClick);
}

$(storyBank);