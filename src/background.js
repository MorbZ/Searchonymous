'use strict';

function start() {
	getWhitelist((whitelist) => {
		// Listen for changed settings
		chrome.runtime.onMessage.addListener((msg) => {
			if(msg.action !== undefined && msg.action == 'settingsChanged') {
				getWhitelist((wl) => {
					whitelist = wl;
				});
			}
		});

		// Register header event listener
		// For Chrome we have to use "extraHeaders" to get the cookie header
		let extraInfoSpec = [
			'blocking',
			'requestHeaders',
		];
		if(chrome.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS')) {
			extraInfoSpec.push('extraHeaders');
		}
		chrome.webRequest.onBeforeSendHeaders.addListener(
			(details) => {
				// Check if Google search URL
				if(!isSearchUrl(details.url)) {
					return;
				}

				// Get cookie header
				let headers = details.requestHeaders;
				let c = getHeader(headers, 'Cookie');
				if(c.i == -1) {
					return;
				}

				// Remove unwanted cookies
				headers[c.i].value = getWhitelistedCookies(c.v, whitelist);
				return {
					requestHeaders: headers
				};
			},
			{
				urls: ['<all_urls>']
			},
			extraInfoSpec,
		);
	});
};

/* Settings */
let cookieSettingNames = [
	['allowNid', 'NID'],
	['allowConsent', 'CONSENT'],
];

// Load whitelist from storage
function getWhitelist(callback) {
	let settings = new Settings();
	settings.load(() => {
		let whitelist = [];
		for(const [setting, cookie] of cookieSettingNames) {
			if(settings.get(setting) == 1) {
				whitelist.push(cookie);
			}
		}
		callback(whitelist);
	});
}

/* Cookies */
function getWhitelistedCookies(cookies, whitelist) {
	// Check for empty whitelist
	if(whitelist.length == 0) {
		return '';
	}

	// Split cookies and check each name (case sensitive)
	let parts = cookies.split('; ');
	let newParts = [];
	for(let part of parts) {
		for(let cookie of whitelist) {
			if(part.startsWith(cookie+'=')) {
				newParts.push(part);
				break;
			}
		}
	}
	return newParts.join('; ');
}

// Returns an object where i is header index and v is the header value. If the
// header does not exist, i will be -1.
function getHeader(headers, name) {
	name = name.toLowerCase();
	for(let i in headers) {
		if(headers[i].name.toLowerCase() == name) {
			return {i: i, v: headers[i].value};
		}
	}
	return {i: -1, v: ''};
}

/* URLs */
// If URL considered a Google search URL. The rules are too complex for a single regex.
function isSearchUrl(url) {
	// Split URL components
	let c = splitUrlComponents(url);
	if(c === false) {
		// No Google domain
		return false;
	}

	// Check subdomains
	if(![
		'',
		'www',
		'images',
		'suggestqueries',
		'search',
		'encrypted',
		'news',
		'video',
		'books',
		'scholar',
	].includes(c.subdomain)) {
		return false;
	}

	// Remove trailing slash
	let path = c.path;
	if(path.endsWith('/')) {
		path = path.substr(0, path.length-1);
	}

	// Check first components
	let firstComp = getFirstPart(path, '/');
	if([
		'', // Homepage
		'webhp', // Homepage
		'preferences', // Block for search settings to not get influenced by account settings
		'complete', // Autocomplete
	].includes(firstComp)) {
		return true;
	}

	// Check last component
	let lastComp = getLastPart(path, '/');
	if(lastComp == 'search') {
		return true;
	}

	// Google News
	if(c.subdomain == 'news') {
		if(lastComp == 'batchexecute') {
			return true;
		}
	}

	// Google Scholar
	if(c.subdomain == 'scholar') {
		if([
			'scholar',
			'scholar_complete',
		].includes(lastComp)) {
			return true;
		}
	}
	return false;
}

// getFirstPart and getLastPart perform better than str.split()...
function getFirstPart(str, sep) {
	let i = str.indexOf(sep);
	if(i === -1) {
		return str
	}
	return str.substr(0, i);
}

function getLastPart(str, sep) {
	let i = str.lastIndexOf(sep);
	if(i === -1) {
		return str
	}
	return str.substr(i+1);
}

// Splits an URL into subdomain, path and search query components. Only handles Google domains. The
// leading slash for path and question mark for query string are omitted. All returned components
// are in lowercase.
function splitUrlComponents(url) {
	url = url.toLowerCase();

	// Regex: https://regex101.com/r/xArIzJ/6
	let re = /^https?:\/\/(?:([a-z]+)\.)?google\.(?:[a-z.]+)\/?(.*?)$/;
	let m = re.exec(url);
	if(m === null) {
		return false;
	}

	// Split path and query string
	let path = '';
	let query = '';
	let pathquery = m[2];
	let i = pathquery.indexOf('?');
	if(i === -1) {
		path = pathquery;
	} else {
		path = pathquery.substr(0, i);
		query = pathquery.substr(i+1);
	}

	return {
		subdomain: m[1] === undefined ? '' : m[1],
		path: path,
		query: query,
	};
}

// Make functions available for tests
if(typeof(module) !== 'undefined') {
	module.exports.getWhitelistedCookies = getWhitelistedCookies;
	module.exports.isSearchUrl = isSearchUrl;
}
