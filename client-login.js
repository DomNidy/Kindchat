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
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: emailField.value,
			password: passwordField.value
		})
	}).then(response => {
		if (response.ok) {
			fetch('/chatroom', {
				method: 'GET',
				headers: {
					'Content-Type': 'text/html'
				}
			})
			response.text().then((response_text) => {
				passwordErrorText.innerText = response_text;
			});
		} else {
			console.error("Error logging in: ", response.statusText);
		}
	}).catch(error => {
		console.error("Error logging in:", error);
	});
}


// If enter is pressed, try and "submit" (hit the login button)
function submitWithEnter(keyPressed) {
    if(keyPressed.key === 'Enter') {
        console.log("Try register");
        clientLogin();
    } 
}

function animateLoginButton() {
    const loginButton = document.getElementById("register-button");
    let step = 1;

    function fadeColors() {
        if(step >= 33) {
            clearInterval(fadeColors);
        } else {
            let a = step/33;
            loginButton.style.backgroundColor = `rgba(2, 102, 189, ${a})`;
            step++;
        }
    }
    setInterval(fadeColors, 8);
}


document.addEventListener('keydown', submitWithEnter);
