'use strict';

function start() {
	getWhitelist((whitelist) => {
		// Listen for changed settings
		chrome.runtime.onMessage.addListener((msg) => {
			if(msg.action !== undefined && msg.action == 'settingsChanged') {
				getWhitelist((wl) => {
					whitelist = wl;
				});
			}
		});

		// Register header event listener
		// For Chrome we have to use "extraHeaders" to get the cookie header
		let extraInfoSpec = [
			'blocking',
			'requestHeaders',
		];
		if(chrome.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS')) {
			extraInfoSpec.push('extraHeaders');
		}
		chrome.webRequest.onBeforeSendHeaders.addListener(
			(details) => {
				// Check if Google search URL
				if(!isSearchUrl(details.url)) {
					return;
				}

				// Get cookie header
				let headers = details.requestHeaders;
				let c = getHeader(headers, 'Cookie');
				if(c.i == -1) {
					return;
				}

				// Remove unwanted cookies
				headers[c.i].value = getWhitelistedCookies(c.v, whitelist);
				return {
					requestHeaders: headers
				};
			},
			{
				urls: ['<all_urls>']
			},
			extraInfoSpec,
		);
	});
};

/* Settings */
let cookieSettingNames = [
	['allowNid', 'NID'],
	['allowConsent', 'CONSENT'],
];

// Load whitelist from storage
function getWhitelist(callback) {
	let settings = new Settings();
	settings.load(() => {
		let whitelist = [];
		for(const [setting, cookie] of cookieSettingNames) {
			if(settings.get(setting) == 1) {
				whitelist.push(cookie);
			}
		}
		callback(whitelist);
	});
}

/* Cookies */
function getWhitelistedCookies(cookies, whitelist) {
	// Check for empty whitelist
	if(whitelist.length == 0) {
		return '';
	}

	// Split cookies and check each name (case sensitive)
	let parts = cookies.split('; ');
	let newParts = [];
	for(let part of parts) {
		for(let cookie of whitelist) {
			if(part.startsWith(cookie+'=')) {
				newParts.push(part);
				break;
			}
		}
	}
	return newParts.join('; ');
}

// Returns an object where i is header index and v is the header value. If the
// header does not exist, i will be -1.
function getHeader(headers, name) {
	name = name.toLowerCase();
	for(let i in headers) {
		if(headers[i].name.toLowerCase() == name) {
			return {i: i, v: headers[i].value};
		}
	}
	return {i: -1, v: ''};
}

/* URLs */
// If URL considered a Google search URL
function isSearchUrl(url) {
	// Check blacklist
	if(!isBlacklisted(url)) {
		return false;
	}

	// Check whitelist
	if(isWhitelisted(url)) {
		return false;
	}
	return true;
}

// Is blacklisted URL?
let urlBlacklist = [
	//Google search page
	/^https?:\/\/((search|www|encrypted)\.)?google\./i,

	//Google autocomplete
	/^https?:\/\/((search|www|encrypted)\.)?google\.[^\/]+\/complete\/.*$/i,
];
function isBlacklisted(url) {
	return testRegexAry(urlBlacklist, url);
}

// Is whitelisted URL?
let urlWhitelist = [
	// Google Voice
	/^https?:\/\/www\.google\.[a-z]*?\/voice/i,

	// Google Maps
	/^https?:\/\/www\.google\.[a-z]*?\/maps/i,
	/^https?:\/\/www\.google\.[a-z]*?\/s\?tbm=map/i,
];
function isWhitelisted(url) {
	return testRegexAry(urlWhitelist, url);
}

// Test regex array on given string
function testRegexAry(ary, string) {
	for(let pattern of ary) {
		if(pattern.test(string)) {
			return true;
		}
	}
	return false;
}

// Make functions available for tests
if(typeof(module) !== 'undefined') {
	module.exports.getWhitelistedCookies = getWhitelistedCookies;
}
