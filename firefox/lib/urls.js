//is blacklisted url?
let blacklist = [
	//Google search page
	/^https?:\/\/((search|www|encrypted)\.)?google\.[^\/]+\/?[^\/]*$/i,
	
	//Google autocomplete
	/^https?:\/\/((search|www|encrypted)\.)?google\.[^\/]+\/complete\/.*$/i,
];
function isBlacklisted(url) {
	return testRegexAry(blacklist, url.spec);
}
exports.isBlacklisted = isBlacklisted;

//is whitelisted url?
let whitelist = [
	//send the correct cookies when settings are changed, otherwise Google 
	//  won't set our new cookies.
	//TODO: find out how Google detects this and make this request anonymous
	//  as well, not critical though, as it is no search.
	/^https?:\/\/((www|encrypted)\.)?google\.[a-z]*?\/setprefs\?/i,
	
	//Google Voice
	/^https?:\/\/www\.google\.[a-z]*?\/voice/i,
	
	//Google Maps
	/^https?:\/\/www\.google\.[a-z]*?\/maps/i,
	/^https?:\/\/www\.google\.[a-z]*?\/s\?tbm=map/i,
];
function isWhitelisted(url) {
	return testRegexAry(whitelist, url.spec);
}
exports.isWhitelisted = isWhitelisted;

//test regex array on given string
function testRegexAry(ary, string) {
	for(var key in ary) {
		var pattern = ary[key];
		if(pattern.test(string)) {
			return true;
		}
	}
	return false;
}