'use strict';

function ready(fn) {
	if(document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

ready(() => {
	localize();
	initOptions();
});

function initOptions() {
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
}

function localize() {
	for(let loc of [
		// [selector, message name, ([placeholders])]
		['p.header', 'optionsHeader'],
		['span.allow', 'optionsAllow'],
		['span.block', 'optionsBlock'],
		['div.preferencesCookie > h2', 'optionsPreferencesCookie'],
		['div.preferencesCookie > p', 'optionsPreferencesCookieDescription', [
			'https://www.google.com/policies/technologies/types/',
		]],
		['div.consentCookie > h2', 'optionsConsentCookie'],
		['div.consentCookie > p', 'optionsConsentCookieDescription'],
	]) {
		// Get localized string
		let params = [];
		if(loc[2] !== undefined) {
			params = loc[2];
		}
		let message = chrome.i18n.getMessage(loc[1], params);

		// Apply string to elements
		for(let elem of document.querySelectorAll(loc[0])) {
			elem.innerHTML = message;
		}
	}
}
