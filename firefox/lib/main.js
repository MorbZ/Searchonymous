//import custom modules
let observer = require("observer");
let cook = require("cookie");
let urls = require("urls");

//create observer
observer.createObserver(observe);

//observe http modify request
function observe(httpChannel) {
	var url = httpChannel.URI;
	
	//check blacklist
	if(!urls.isBlacklisted(url)) {
		return;
	}

	//check whitelist
	if(urls.isWhitelisted(url)) {
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
let data = require("sdk/self").data;
require("sdk/page-mod").PageMod({
	include: /^https?:\/\/((www|encrypted)\.)?google\..*/,
	contentScriptWhen: "ready",
	contentStyleFile: data.url("google.css"),
	contentScriptFile: data.url("google.js")
});