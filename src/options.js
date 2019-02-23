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

/* Localization */
function localize() {
	for(let loc of [
		// [selector, message name]
		['p.header', 'optionsHeader'],
		['span.allow', 'optionsAllow'],
		['span.block', 'optionsBlock'],
		['div.preferencesCookie > h2', 'optionsPreferencesCookie'],
		['div.preferencesCookie > p', 'optionsPreferencesCookieDescription'],
		['div.consentCookie > h2', 'optionsConsentCookie'],
		['div.consentCookie > p', 'optionsConsentCookieDescription'],
	]) {
		// Get localized string
		let message = chrome.i18n.getMessage(loc[1]);

		// Apply string to elements
		for(let elem of document.querySelectorAll(loc[0])) {
			appendLinkText(elem, message);
		}
	}
}

// Avoid unsafe assignment to innerHTML by manually creating DOM elements.
// Uses Markdown syntax for replacing "[name](url)" with a HTML link.
function appendLinkText(elem, str) {
	// Regex: https://regex101.com/r/214K89/2
	let re = /\[(.*?)\]\((.*?)\)/g;
	let i = 0;
	let m;
	while((m = re.exec(str)) != null) {
		// Add text
		appendText(elem, str.substr(i, m.index-i));
		i = m.index + m[0].length;

		// Add link
		let a = document.createElement('a');
		a.href = m[2];
		appendText(a, m[1]);
		elem.appendChild(a);
	}

	// Add remaining text
	appendText(elem, str.substr(i));
}

function appendText(elem, str) {
	if(str.length > 0) {
		elem.appendChild(document.createTextNode(str));
	}
}
