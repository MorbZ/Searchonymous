//import custom modules
let observer = require("observer");

//create observer
observer.createObserver(observe);

//whitelisted parameters of the Google cookie
var whitelist = [
	"LD", //Example: de; Language for the site
	"LR", //Example: lang_de|lang_en; Language(s) for searching
	"SG", //Example: 1; Google Instant setting: 1 = Computer fast enough, 2 = Off, 3 = On
	"NR", //Example: 40; Search results per page, (Requires SG=2)
];

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

	//get cookies from request headers
	try {
		var cookie = httpChannel.getRequestHeader("Cookie");
	} catch(e) {}
	if(cookie != undefined) {
		//use a random 16 digit hash as PREF ID, otherwise Google won't accept 
		//  the other parameters. we could use 16 zeros as well but that would 
		//  make it easier to detect that this add-on is used.
		var newElements = [];
		newElements.push("ID=" + getRandomHash(16));
	
		//disassemble the original cookie
		var elements = parseGoogleCookie(cookie);
		for(var key in elements) {
			if(whitelist.indexOf(key) != -1) {
				value = elements[key];
				newElements.push(key + "=" + value);
			}
		}
	
		//make new cookie
		var newCookie = "PREF=" + newElements.join(":");
		httpChannel.setRequestHeader("Cookie", newCookie, false);
	}
}

/* Add-on Life Cycle */
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
var pageMod = require("sdk/page-mod");
pageMod.PageMod({
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

/* Cookie */
//parses a Google cookie and returns all PREF elements in array
function parseGoogleCookie(cookie) {
	//get PREF cookie value
	var pref = getCookieValue(cookie, "PREF");
	if(pref == null) {
		return [];
	}

	//get elements
	var elements = [];
	params = pref.split(":");
	for(var key in params) {
		//split key and value
		param = params[key];
		paramAry = param.split("=");
		if(paramAry.length != 2) {
			continue;
		}
		elements[paramAry[0]] = paramAry[1];
	}
	return elements;
}

//returns the value of the given cookie string and key or null if key doesn't exist
function getCookieValue(cookie, key) {
	var nameEQ = key + "=";
	var ca = cookie.split(';');
	var len = ca.length;
	for (var i = 0; i < len; i++) {
	var c = ca[i];
	while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

//returns a random hash
function getRandomHash(len) {
	var charSet = "0123456789abcdef";
	var randomHash = "";
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomHash += charSet.substring(randomPoz, randomPoz+1);
	}
	return randomHash;
}