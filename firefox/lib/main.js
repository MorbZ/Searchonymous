// Import custom modules
let observer = require("./observer");
let urls = require("./urls");

// Create observer
observer.createObserver(observe);

// Observe HTTP modify request
function observe(httpChannel) {
	var url = httpChannel.URI.spec;

	// Check if Google search URL
	if(!urls.isSearchUrl(url)) {
		return;
	}

	// Remove cookie from headers
	httpChannel.setRequestHeader("Cookie", "", false);
}

// Addon load
exports.main = function() {
	observer.register();
};

// Addon unload
exports.onUnload = function() {
	observer.unregister();
}

// Remove cookie/privacy hints that would popup on every page visit otherwise
let data = require("sdk/self").data;
require("sdk/page-mod").PageMod({
	include: /^https?:\/\/((www|encrypted)\.)?google\..*/,
	contentScriptWhen: "ready",
	contentStyleFile: data.url("google.css")
});
