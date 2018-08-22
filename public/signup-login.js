'use strict';

let AUTH_TOKEN
const COOKIE_NAME = 'APP_LOGIN_TOKEN'

function saveLoginResponse(data) {
	Cookies.set(COOKIE_NAME, JSON.stringify(data));
}

function restoreLoginResponse() {
	const dataStr = Cookies.get(COOKIE_NAME);
	if (dataStr) {
		const data = JSON.parse(dataStr)
		console.log('Saved login data', data)
		navigateToStories(data, false)
	}
}


function renderSignUpForm() {

	const createURL = API_URLS.createNewUser;

	return `
	<form class="js-signUp-form" id="signUpForm" action="${createURL}" method="POST">
		<fieldset id="storyBankForm">
			<legend>Sign Up</legend>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="userName" class="mdl-textfield__input" name="userEmail" required>
				<label id="userNameLabel" class="mdl-textfield__label" for="userName">Email</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="password" class="mdl-textfield__input" type="password" name="password" required>
				<label id="passwordLabel" class="mdl-textfield__label" for="password">Password (10 characters minimum)</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="passwordConfirm" class="mdl-textfield__input" type="password" name="passwordConfirm" required>
				<label id="passwordConfirmLabel" class="mdl-textfield__label" for="passwordConfirm">Confirm Password</label>
			</div>
			<p class="passwordMessage"></p>
			<div class="menuButtonHolder">
				<button type="button" class="userButton" id="cancel">Cancel</button>
				<button type="submit" class="userButton" id="submitSignupForm">Create Account</button>
			</div>
		</fieldset>
	</form>
	`
}

function handleSignUpClick() {
	$('#signUp').on('click', function (event) {
		event.preventDefault();
		const signUp = renderSignUpForm();
		$('.formsHolder').html(signUp);
		$('.formsHolder').removeClass('hide');
		$('.formsHolder').addClass('giveFormSpace');
		componentHandler.upgradeDom();
	});
}

function renderProfileHeader(result) {
	return `
	<p>${result.email}</p>`
}

//POST
function handleCreateNewUser() {
	const $form = $('#signUpForm'),
		email = $form.find('input[name="userEmail"]').val().toLowerCase(),
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
		$('.formsHolder').empty();
		const userLoginRequest = $.post(logInURL, {
			email: email,
			password: password
		});
			userLoginRequest.done(data => navigateToStories(data, true));
	});
}

function renderLogInForm() {

	const logInURL = API_URLS.userLogIn;

	return `
	<form class="js-logIn-form" id="logInForm" action="${logInURL}">
		<fieldset id="storyBankForm">
			<legend>Log In</legend>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="userName" class="mdl-textfield__input" name="userEmail" required>
				<label id="userNameLabel" class="mdl-textfield__label" for="userName">Email</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="password" class="mdl-textfield__input" type="password" name="password" required>
				<label id="passwordLabel" class="mdl-textfield__label passwordLabel" for="password">Password</label>
			</div>
			<div class="menuButtonHolder">
				<button type="button" class="userButton" id="cancel">Cancel</button>
				<button type="submit" class="userButton" id="submitLoginForm">Log In</button>
			</div>
		</fieldset>
	</form>
    `
}

function handleLogInClick() {
	$('#logIn').on('click', function (event) {
		event.preventDefault();
		const logIn = renderLogInForm();
		$('.formsHolder').html(logIn);
		$('.formsHolder').removeClass('hide');
		$('.formsHolder').addClass('giveFormSpace');
		componentHandler.upgradeDom();
	});
}

function navigateToStories(data, saveResponse = false) {
	AUTH_TOKEN = data.authToken;
	if (saveResponse) {
		saveLoginResponse(data)
	}
	$('.formsHolder').empty();
	$('.formsHolder').removeClass('giveFormSpace');
	$('.discoverView').removeClass('hide');
	$('.storyBankHeader').find('.userSignUp').hide('slow');
	$('.storyBankHeader').find('.userLogIn').hide('slow');
	$('.js-block-result').removeClass('hide');
	$('.js-create-block-view').removeClass('hide');
	$('.profileContainer').removeClass('hide');
	$('.userProfileName').html(data.email);
	$('html, body').animate({
		scrollTop: $('.storyBankMainContent').offset().top -100
	}, 'slow');

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
}

function handleUserLogIn() {
	const $form = $('#logInForm'),
		email = $form.find('input[name="userEmail"]').val().toLowerCase(),
		password = $form.find('input[name="password"]').val();

	const url = $form.attr('action');

	const userLoginRequest = $.post(url, {
		email: email,
		password: password
	});

	userLoginRequest.done(data => navigateToStories(data, true));
}

function handleLogOutUser() {
	$('#logOutButton').on('click', function (event) {
		event.preventDefault();
		AUTH_TOKEN = null;
		Cookies.remove(COOKIE_NAME);
		$('.profileOptions').removeClass('profileVisibleOptions');
		$('.storyViewing').css('background-color', '#00000000');
		$('.storyBankHeader').find('.userLogOut').remove();
		$('.storyBankHeader').find('.userSignUp').show('slow');
		$('.storyBankHeader').find('.userLogIn').show('slow');
		$('.js-create-block-view').addClass('hide');
		$('.profileContainer').addClass('hide');
		$('.discoverViewing').addClass('hide');
		$('.js-block-result').empty();
		$('.js-block-result').addClass('hide');
		$('.storyBlockView-Title').empty();
		$('.storyBlockView').empty();
		$('.storyCreateInterface').empty();
		$('.storyBlockCreateHolder').empty();
	});
}

function renderChangePasswordForm () {
	const updateUrl = API_URLS.changePassword;

	return `
	<form id="changePassword" action="${updateUrl}" method="POST">
		<fieldset id="storyBankForm">
			<legend>Change Password</legend>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="password" class="mdl-textfield__input" type="password" name="password" required>
				<label id="passwordLabel" class="mdl-textfield__label" for="password">New Password</label>
			</div>
			<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="storyBankFormInput">
				<input id="passwordConfirm" class="mdl-textfield__input" type="password" name="passwordConfirm" required>
				<label id="passwordConfirmLabel" class="mdl-textfield__label" for="passwordConfirm">Retype New Password</label>
			</div>
			<p class="passwordMessage"></p>
			<div class="menuButtonHolder">
				<button type="button" class="userButton" id="cancel">Cancel</button>
				<button type="submit" class="userButton" id="submitPasswordChange">Update</button>
			</div>
		</fieldset>
	</form>
	`
}

function displayChangePasswordForm() {
	$('#changePasswordButton').on('click', function(event) {
		event.preventDefault();
		const changePasswordForm = renderChangePasswordForm();
		$('.profileOptions').removeClass('profileVisibleOptions');
		$('.formsHolder').html(changePasswordForm);
		$('.formsHolder').removeClass('hide');
		$('.formsHolder').addClass('giveFormSpace');
		componentHandler.upgradeDom();
	});
}

function hideUserForms() {
	$('.formsHolder').on('click', 'button#cancel', function(event) {
		event.preventDefault();
		$('.formsHolder').addClass('hide');
		$('.formsHolder').removeClass('giveFormSpace');
	});
}

function validatePasswordChange() {
	const password = $('#password').val();
	const retyped = $('#passwordConfirm').val();
	if (password != retyped) {
		$('.passwordMessage').html('Passwords do not match');
		$('.passwordMessage').addClass('noMatch');
		$('.passwordMessage').removeClass('match');
	} else {
		$('.passwordMessage').html('Passwords Match');
		$('.passwordMessage').addClass('match');
		$('.passwordMessage').removeClass('noMatch');
	}
}

function comparePasswords() {
	$('.formsHolder').on('keyup', '#password, #passwordConfirm', function() {
		validatePasswordChange();
	});
}

//POST
function handleChangePassword () {
	const $form = $('#changePassword'),
		password = $form.find('input[name="password"]').val(),
		retyped = $form.find('input[name="passwordConfirm"]').val(),
		url = $form.attr('action');

	const changePasswordRequest = $.ajax({
		type: "POST",
		url: url,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${AUTH_TOKEN}`
		},
		dataType: 'json',
		data: JSON.stringify({
			newPassword: password,
			retypeNewPassword: retyped
		})
	});

	changePasswordRequest.done(function (data) {
		$('.formsHolder').empty();
		$('.formsHolder').removeClass('giveFormSpace');
		const message = renderMessages(data.message);
		$('.changePasswordHolder').removeClass('hide');
		$('.changePasswordHolder').html(message);
	});
}

function acceptPasswordChangeMessage() {
	$('.changePasswordHolder').on('click','button#acceptMessage', function() {
		$('.changePasswordHolder').addClass('hide');
	});
}

function viewProfileOptions() {
	$('.profileContainer').on('click', 'button.userProfileName', function(event) {
		event.preventDefault();
		$('.profileOptions').toggleClass('profileVisibleOptions');
	});
}

function userLogInSignUp() {
	$(handleSignUpClick);
	$(handleLogInClick);
	$(handleLogOutUser);
	$(restoreLoginResponse);
	$(displayChangePasswordForm);
	$(comparePasswords);
	$(acceptPasswordChangeMessage);
	$(hideUserForms);
	$(viewProfileOptions);
}

$(userLogInSignUp);