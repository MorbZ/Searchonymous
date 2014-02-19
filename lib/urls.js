//is Google settings URL?
let settings_pattern = /^https?:\/\/((www|encrypted)\.)?google\.[a-z]*?\/setprefs\?/i;
function isGoogleSettingsUrl(url) {
	return settings_pattern.test(url);
}
exports.isGoogleSettingsUrl = isGoogleSettingsUrl;

//is Google search URL?
let search_pattern = /^https?:\/\/((www|encrypted)\.)?google\.[^\/]+\/?[^\/]*$/i;
function isGoogleSearchUrl(url) {
	return search_pattern.test(url);
}
exports.isGoogleSearchUrl = isGoogleSearchUrl;