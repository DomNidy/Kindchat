function clientRegister() {
    animateRegisterButton();
	// If password field does not validate, return and dont send the request
	if (!validatePassword()) {
		return;
	}

	// Get password & username from fields
	const emailField = document.getElementById("email-field");
	const passwordField = document.getElementById("password-field");

	console.log("Sending request to register...");

	fetch('/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: emailField.value,
			password: passwordField.value
		})
	})
		.then(response => {
			if (response.ok) {
				console.log("Registered successfully!");
			} else {
				console.error("Error registering user:", response.statusText);
			}
		}).catch(error => {
			console.error("Error registering user:", error)
		});
}


function passwordFieldsMatch() {
	let passFields = [document.getElementById("password-field"), document.getElementById("confirm-password-field")];
	if (passFields[0].value == passFields[1].value) {
		return true;
	}
	else {
		return false;
	}
}


const passwordInputField = document.getElementById("password-field");
const confirmPasswordInputField = document.getElementById("confirm-password-field");
const passwordError = document.getElementById("password-error");
function validatePassword() {
	// Password conditions that must be met
	const password = passwordInputField.value;
	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasDigit = /\d/.test(password);
	const isLongEnough = password.length >= 8;
	const confirmationFieldMatches = passwordFieldsMatch();

	// Dictionairy of error messages, the key is interpreted as a string 
	const conditionsDict = {
		hasUpper: "Password needs a capital letter.",
		hasLower: "Password needs a lowercase letter.",
		hasDigit: "Password needs a digit. (0-9)",
		isLongEnough: "Password must be at least 8 characters long",
		confirmationFieldMatches: "Password & confirm password fields do not match."
	};

	// Using the 
	const errors = Object.entries({
		hasUpper,
		hasLower,
		hasDigit,
		isLongEnough,
		confirmationFieldMatches
	}).reduce((acc, [errorMessage, value]) => {
		if (!value) {
			acc.push(errorMessage);
		}
		return acc;
	}, []);

	if (errors.length >= 1) {
		passwordError.innerText = '';
		errors.forEach((error) => {
			passwordError.innerText += conditionsDict[error] + '\n';
		}, []);
		return false;
	}
	passwordError.innerText = "";
	return true;
}

// If enter is pressed, try and "submit" (hit the register button)
function submitWithEnter(keyPressed) {
    if(keyPressed.key === 'Enter') {
        console.log("Try register");
        clientRegister();
    } 
}

function animateRegisterButton() {
    const registerButton = document.getElementById("register-button");
    let step = 1;

    function fadeColors() {
        if(step >= 33) {
            clearInterval(fadeColors);
        } else {
            let a = step/33;
            registerButton.style.backgroundColor = `rgba(2, 102, 189, ${a})`;
            step++;
        }
    }
    setInterval(fadeColors, 8);
}

// Add event listeners
document.addEventListener('keydown', submitWithEnter);
