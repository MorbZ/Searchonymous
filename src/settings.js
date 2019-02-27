'use strict';

// Persistant storage of user settings
class Settings {
	constructor() {
		this.s = new Map([
			[
				'allowNid',
				{
					locale: 'preferencesCookie',
					name: 'NID',
					value: 0,
				},
			],
			[
				'allowConsent',
				{
					locale: 'consentCookie',
					name: 'CONSENT',
					value: 1,
				},
			],
			[
				'allowAbuseExemption',
				{
					locale: 'captchaCookie',
					name: 'GOOGLE_ABUSE_EXEMPTION',
					value: 1,
				}
			],
		]);
	}

	// Update value and send a notification
	update(name, value) {
		this.set(name, value);
		this.setStorage(name, value, () => {
			// Send notification
			chrome.runtime.sendMessage({action: 'settingsChanged'});
		});
	}

	// Update storage. Callback is called after value has been stored.
	setStorage(name, value, callback = () => {}) {
		let item = {};
		item[name] = value;
		chrome.storage.sync.set(item, callback);
	}

	// Update local map
	set(name, value) {
		let cookie = this.s.get(name);
		cookie.value = value;
		this.s.set(name, cookie);
	}

	get(name) {
		return this.s.get(name);
	}

	// Returns key/value tuples for setting
	getAll() {
		return this.s.entries();
	}

	// Load the settings. Setting values are available after callback is called.
	load(callback) {
		chrome.storage.sync.get(null, (items) => {
			for(let [name, cookie] of this.s) {
				if(items[name] !== undefined) {
					// Use value that has already been stored
					this.set(name, items[name]);
				} else {
					// Initialize default value on storage
					this.setStorage(name, cookie.value);
				}
			}
			callback();
		});
	}
}
