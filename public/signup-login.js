'use strict';

let AUTH_TOKEN

function renderSignUpForm() {

	const createURL = API_URLS.createNewUser;

	return `<form class="js-signUp-form" id="signUpForm" action="${createURL}" method="POST">
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="userName" class="mdl-textfield__input" name="userEmail">
		<label class="mdl-textfield__label" for="userName">Email</label>
	</div>
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="password" class="mdl-textfield__input" type="password" name="password">
		<label class="mdl-textfield__label" for="password">Password</label>
	</div>
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="passwordConfirm" class="mdl-textfield__input" type="password" name="passwordConfirm">
		<label class="mdl-textfield__label" for="passwordConfirm">Confirm Password</label>
	</div>
	<button type="submit" class="userButton">Create Account</button>
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

function renderProfileHeader(result) {
	return `
	<p>${result.email}</p>`
}


function handleCreateNewUser() {
	const $form = $('#signUpForm'),
		email = $form.find('input[name="userEmail"]').val(),
		password = $form.find('input[name="password"]').val(),
		confirmPassword = $form.find('input[name="passwordConfirm"]');

	const url = $form.attr('action');


	const userRecord = $.post(url, {
		email: email,
		password: password
	});
	//This will use the url for logging in but retain email/password
	//creating a new user
	const logInURL = API_URLS.userLogIn;

	userRecord.done(function (data) {
		$('#formsHolder').empty();
		const userLoginRequest = $.post(logInURL, {
			email: email,
			password: password
		});
		//User has been created and will
		//now be signed in automatically
		userLoginRequest.done(function (data) {
			console.log(data);
			const logOutButton = renderLogOutButton();
			$('.storyBankHeader').append(logOutButton);
			$('.storyBankHeader').find('.userSignUp').hide('slow');
			$('.storyBankHeader').find('.userLogIn').hide('slow');
			$('.js-create-block-view').show('slow');
			$('.userProfileName').html(data.email);
			AUTH_TOKEN = data.authToken;
		});

	});
}

function renderLogInForm() {

	const logInURL = API_URLS.userLogIn;

	return `<form class="js-logIn-form" id="logInForm" action="${logInURL}">
	<div id="mdlFloat" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="userName" class="mdl-textfield__input" name="userEmail">
		<label class="mdl-textfield__label" for="userName">Email</label>
	</div>
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="password" class="mdl-textfield__input" type="password" name="password">
		<label id ="passwordLabel" class="mdl-textfield__label passwordLabel" for="password">Password</label>
	</div>
	<button type="submit" class="userButton">Log In</button>
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

function handleUserLogIn() {
	const $form = $('#logInForm'),
		email = $form.find('input[name="userEmail"]').val(),
		password = $form.find('input[name="password"]').val();

	const url = $form.attr('action');

	const userLoginRequest = $.post(url, {
		email: email,
		password: password
	});

	userLoginRequest.done(function (data) {
		console.log(data);
		AUTH_TOKEN = data.authToken;
		$('#formsHolder').empty();
		const logOutButton = renderLogOutButton();
		$('.storyBankHeader').append(logOutButton);
		$('.storyBankHeader').find('.userSignUp').hide('slow');
		$('.storyBankHeader').find('.userLogIn').hide('slow');
		$('.js-create-block-view').show('slow');
		$('.userProfileName').html(data.email);

		const record = $.ajax({
            type: "GET",
            url: `${API_URLS.getUserBlocks}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        record.done(function (data) {
            return displayBlock(data);
        });
	});
}

function handleUserFormsSubmit() {

	$('body').submit(function (event) {
		event.preventDefault();

		const formID = $(event.target).attr('id')
		console.log('Submitted form id is:', formID)

		if (formID === 'signUpForm') {

			handleCreateNewUser();
		}

		if (formID === 'logInForm') {

			handleUserLogIn();
		}

	});
}

function renderLogOutButton() {
	return `
	<button type="button" class="userButton userLogOut">Log Out</button>`
}

function handleLogOutUser() {
	$('.storyBankHeader').on('click', 'button.userLogOut', function (event) {
		event.preventDefault();
		console.log('logout button was clicked');
		AUTH_TOKEN = null;
		$('.storyBankHeader').find('.userLogOut').remove();
		$('.storyBankHeader').find('.userSignUp').show('slow');
		$('.storyBankHeader').find('.userLogIn').show('slow');
		$('.js-create-block-view').hide('slow');
		$('.userProfileName').empty();
		$('.js-block-result').empty();
		$('.storyBlockView-Title').empty();
		$('.storyBlockView').empty();
		$('.storyCreateInterface').empty();
		$('.storyBlockCreateHolder').empty();
	});
}

$(handleSignUpClick);
$(handleLogInClick);
$(handleUserFormsSubmit);
$(handleLogOutUser);