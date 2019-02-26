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
		// Create cookie option boxes
		let wrapper = document.querySelector('.wrapper');
		for(let [name, cookie] of settings.getAll()) {
			/*
			Template:
			<div class="option">
				<span>{Cookie}</span>
				<h2>{Name}</h2>
				<p>{Description}</p>

				<label><input type="radio" name="{ID}" value="1"> <span class="allow">{Allow}</span></label>
				<label><input type="radio" name="{ID}" value="0"> <span class="block">{Block}</span></label>
			</div>
			*/

			// Box
			let div = document.createElement('div');
			div.classList.add('option');
			wrapper.appendChild(div);

			// Cookie name
			let span = document.createElement('span');
			span.classList.add('info');
			appendText(span, `Name: ${cookie.name}`);
			div.appendChild(span);

			// Title
			let h2 = document.createElement('h2');
			appendLocaleText(h2, cookie.locale+'Name');
			div.appendChild(h2);

			// Description
			let p = document.createElement('p');
			appendLocaleText(p, cookie.locale+'Description');
			div.appendChild(p);

			// Radio buttons
			for(let button of [
				[1, 'allow', 'optionsAllow'],
				[0, 'block', 'optionsBlock'],
			]) {
				// Label
				let label = document.createElement('label');
				div.appendChild(label);

				// Radio button
				let value = button[0];
				let radio = document.createElement('input');
				radio.type = 'radio';
				radio.value = value;
				radio.name = name;
				if(cookie.value == value) {
					radio.checked = true;
				}
				radio.addEventListener('change', () => {
					settings.update(name, value);
				});
				label.appendChild(radio);

				// Text
				appendText(label, ' ');
				appendLocaleText(label, button[2]);
			}
		}
	});
}

/* Localization */
function localize() {
	for(let loc of [
		// [selector, message name]
		['p.header', 'optionsHeader'],
	]) {
		// Apply locale messages to elements
		for(let elem of document.querySelectorAll(loc[0])) {
			appendLocaleText(elem, loc[1]);
		}
	}
}

// Avoid unsafe assignment to innerHTML by manually creating DOM elements.
// Uses Markdown syntax for replacing "[name](url)" with a HTML link.
function appendLocaleText(elem, name) {
	// Get message
	let str = chrome.i18n.getMessage(name);

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
