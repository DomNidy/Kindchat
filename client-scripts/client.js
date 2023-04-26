function animateLogo() {
	const logo = document.getElementsByClassName("wisp-logo");
	const maxRotAngle = 9;
	const rotateTimeMS = 6600;
	let startTime = performance.now();

	function updateLogoRotation() {
		// Start elapsed timer
		const elapsed = performance.now() - startTime;
		// Progress of rotation
		const t = elapsed / rotateTimeMS;
		const rotAngle = Math.PI * t;
		const value = Math.sin(rotAngle);
		// Convert value from [0, 1] to [-1, -1]
		const result = value * 2 - 1;

		logo[0].style.transform = `rotate(${maxRotAngle * result}deg)`;
		if (elapsed < rotateTimeMS) {
			requestAnimationFrame(updateLogoRotation);
		}
		// Once rotation finishes, alternate the direction of the rotation
		else if (elapsed >= rotateTimeMS) {
			// Reset start time
			startTime = performance.now();
			// Rotation finishes
			requestAnimationFrame(updateLogoRotation);
		}
	}
	requestAnimationFrame(updateLogoRotation);
}


// Animate wisp logo
animateLogo();

