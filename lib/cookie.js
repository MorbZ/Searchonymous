//whitelisted parameters of the Google cookie
let whitelist = [
	"LD", //Example: de; Language for the site
	"LR", //Example: lang_de|lang_en; Language(s) for searching
	"SG", //Example: 1; Google Instant setting: 1 = Computer fast enough, 2 = Off, 3 = On
	"NR", //Example: 40; Search results per page, (Requires SG=2)
];

//clean a Google cookie
function cleanCookie(cookie) {
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
	return newCookie;
}
exports.cleanCookie = cleanCookie;

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