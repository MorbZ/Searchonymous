//import custom modules
let observer = require("observer");
let cook = require("cookie");
let urls = require("urls");

//create observer
observer.createObserver(observe);

//observe http modify request
function observe(httpChannel) {
	//are we on a Google domain?
	var url = httpChannel.URI.spec;
	if(!urls.isGoogleSearchUrl(url)) {
		return;
	}

	//send the correct cookies when settings are changed, otherwise Google 
	//  won't set our new cookies.
	//TODO: find out how Google detects this and make this request anonymous
	//  as well, not critical though, as it is no search.
	if(urls.isGoogleSettingsUrl(url)) {
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