'use strict';

function ready(fn) {
	if(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

ready(() => {
	let settings = new Settings();
	settings.load(() => {
		// Set values for radio buttons
		for(const [name, value] of settings.getAll()) {
			let radios = document.getElementsByName(name);
			for(let radio of radios) {
				// Set checked
				if(radio.value == value) {
					radio.checked = true;
				}

				// Register change event
				radio.addEventListener('change', () => {
					settings.set(radio.name, radio.value);
				});
			}
		}
	});
});
