'use strict';

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

function renderProfileHeader(result) {
	return `
	<p>${result.email}</p>`
}

function handleCreateNewUser() {
	const $form = $('#signUpForm'),
		email = $form.find('input[name="userEmail"]').val(),
		password = $form.find('input[name="password"]').val();
		
		const url = $form.attr('action');
		
		const userRecord = $.post(url, {
			email: email,
			password: password
		});

		userRecord.done(function (data) {
			const userProfile = renderProfileHeader(data.user);
			$('.userProfileContainer').html(userProfile)
		});
}

function renderLogInForm() {
    return `<form class="js-logIn-form" type="submit" id="logInForm">
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
		<input id="userName" class="mdl-textfield__input">
		<label class="mdl-textfield__label" for="userName">Email</label>
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

function handleUserFormsSubmit() {

    $('body').submit(function (event) {
        event.preventDefault();

        const formID = $(event.target).attr('id')
        console.log('Submitted form id is:', formID)

        if (formID === 'signUpForm') {
            
            handleCreateNewUser();
        }

        if (formID === 'logInForm') {
            
            
        }

    });
}

$(handleSignUpClick);
$(handleLogInClick);
$(handleUserFormsSubmit);