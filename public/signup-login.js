'use strict';

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

$(handleSignUpClick);
$(handleLogInClick);