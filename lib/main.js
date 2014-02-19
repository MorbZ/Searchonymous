//import custom modules
let observer = require("observer");
let cook = require("cookie");

//create observer
observer.createObserver(observe);

//observe http modify request
function observe(httpChannel) {
	//are we on a Google domain?
	var url = httpChannel.URI.spec;
	if(!isGoogleSearchUrl(url)) {
		return;
	}

	//send the correct cookies when settings are changed, otherwise Google 
	//  won't set our new cookies.
	//TODO: find out how Google detects this and make this request anonymous
	//  as well, not critical though, as it is no search.
	if(isGoogleSettingsUrl(url)) {
		return;
	}

	//set cleaned cookie
	try {
		var cookie = httpChannel.getRequestHeader("Cookie");
	} catch(e) {}
	if(cookie != undefined) {
		cookie = cook.cleanCookie(cookie);
		httpChannel.setRequestHeader("Cookie", cookie, false);
	}
}

//load
exports.main = function() {
	observer.register();
};

//unload
exports.onUnload = function() {
	observer.unregister();
}

//get rid of page decoration and change country name to anonymous
var data = require("sdk/self").data;
require("sdk/page-mod").PageMod({
	include: /^https?:\/\/((www|encrypted)\.)?google\..*/,
	contentScriptWhen: "ready",
	contentStyleFile: data.url("google.css"),
	contentScriptFile: data.url("google.js")
});

/* URL Check */
//is Google settings URL?
var settings_pattern = /^https?:\/\/((www|encrypted)\.)?google\.[a-z]*?\/setprefs\?/i;
isGoogleSettingsUrl = function(url) {
	return settings_pattern.test(url);
}

//is Google search URL?
var search_pattern = /^https?:\/\/((www|encrypted)\.)?google\.[^\/]+\/?[^\/]*$/i;
isGoogleSearchUrl = function(url) {
	return search_pattern.test(url);
}