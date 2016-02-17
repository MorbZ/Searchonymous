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
exports.isSearchUrl = isSearchUrl;

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
