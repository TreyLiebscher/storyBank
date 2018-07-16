'use strict';

// http://treys-imac.local:8080/

function getBlocks(id, callback) {
    const requestURI = `http://treys-imac.local:8080/storyblock/block/${id}`;
    $.getJSON(requestURI, callback);
}

function displayBlock(data) {
    const results = `
    <div class="storyBlock" style="background-color:${data.block.color}">
        <h3>${data.block.title}</h3>        
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

function renderBlock(data) {
    return `
    <div class="storyBlock" id="${data.block.id}" style="background-color:${data.block.color}">
        <h3>${data.block.title}</h3>        
    </div>`
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
            const content = renderBlock(data);
            $('.js-block-result').empty().append(content);
        });
    });
}



function storyBank() {
    $(watchBlockSearchSubmit);
    // $(handleBlockSubmit);
    $(createBlock);
    $(handleSignUpClick);
    $(handleLogInClick);
}

$(storyBank);