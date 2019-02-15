'use strict';

// For Chrome we have to use "extraHeaders" to get the cookie header
let extraInfoSpec = [
	'blocking',
	'requestHeaders',
];
if (chrome.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS')) {
	extraInfoSpec.push('extraHeaders');
}

// Register header event listener
chrome.webRequest.onBeforeSendHeaders.addListener(
	onBeforeHeaders,
	{
		urls: ['<all_urls>']
	},
	extraInfoSpec,
);

// Change response cookies
function onBeforeHeaders(details) {
	// Check if Google search URL
	if(!isSearchUrl(details.url)) {
		return;
	}

	// Remove unwanted cookies
	let headers = details.requestHeaders;
	changeCookieHeader(headers);
	return {
		requestHeaders: headers
	};
}

/* Cookies */
function changeCookieHeader(headers) {
	// Get cookie header
	let c = getHeader(headers, 'Cookie');
	if(c.i == -1) {
		return;
	}

	// Only use whitelisted cookie names
	let parts = c.v.split('; ');
	let newParts = [];
	for(let part of parts) {
		if(part.startsWith('NID=') || part.startsWith('CONSENT=')) {
			newParts.push(part);
		}
	}

	// Combine cookie
	headers[c.i].value = newParts.join('; ');
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
