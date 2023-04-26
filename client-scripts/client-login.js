function clientLogin() {
	animateLoginButton();
	const emailField = document.getElementById("login-email-field");
	const passwordField = document.getElementById("login-password-field");
	// This element is used to display error text when user fails to login
	const passwordErrorText = document.getElementById("password-error");
	passwordErrorText.innerText = "...";

	console.log("Sending request to login...")
	fetch('/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'text/html',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate'
		},
		body: JSON.stringify({
			email: emailField.value,
			password: passwordField.value
		})
	}).then(response => {
		passwordErrorText.innerText = response.statusText;

		// If the login request is a success redirect
		if (response.ok) {
			window.location.href = response.url;
		}

	}).catch(error => {
		console.error("Error logging in:", error);
	});
}


// If enter is pressed, try and "submit" (hit the login button)
function submitWithEnter(keyPressed) {
	if (keyPressed.key === 'Enter') {
		console.log("Try register");
		clientLogin();
	}
}

function animateLoginButton() {
	const loginButton = document.getElementById("register-button");
	let step = 1;

	function fadeColors() {
		if (step >= 33) {
			clearInterval(fadeColors);
		} else {
			let a = step / 33;
			loginButton.style.backgroundColor = `rgba(2, 102, 189, ${a})`;
			step++;
		}
	}
	setInterval(fadeColors, 8);
}


document.addEventListener('keydown', submitWithEnter);
