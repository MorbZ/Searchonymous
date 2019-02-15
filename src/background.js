"use strict";

// We can't use a content-script since URL-regexes don't allow checking for wildcard TLDs
let contentPattern = /^https?:\/\/((www|encrypted)\.)?google\..*/;
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(contentPattern.test(tab.url)) {
		// Remove cookie/privacy hints that would popup on every page visit otherwise
		chrome.tabs.insertCSS(tabId, {
			file: 'google.css'
		});
	}
});

// Register header event listener
chrome.webRequest.onBeforeSendHeaders.addListener(
	onBeforeHeaders,
	{
		urls: ['<all_urls>']
	},
	[
		'requestHeaders',
		'blocking'
	]
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
	for(var key in ary) {
		var pattern = ary[key];
		if(pattern.test(string)) {
			return true;
		}
	}
	return false;
}
