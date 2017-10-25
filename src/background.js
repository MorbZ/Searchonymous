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

// Remove cookie from headers
function onBeforeHeaders(details) {
	// Check if Google search URL
	if(!isSearchUrl(details.url)) {
		return;
	}

	// Get Cookie
	var headers = details.requestHeaders;
	for(var i = 0; i < headers.length; i++) {
		if(headers[i].name == 'Cookie') {
			// Remove cookies
			headers.splice(i, 1);

			// Return new headers
			return {
				requestHeaders: headers
			};
		}
	}
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
	/^https?:\/\/((search|www|encrypted)\.)?google\.[^\/]+\/?[^\/]*$/i,

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
