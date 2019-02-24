'use strict';

// Persistant storage of user settings
class Settings {
	constructor() {
		this.s = new Map([
			['allowNid', 0],
			['allowConsent', 1],
		]);
	}

	// Update the value in the storage
	set(name, value) {
		this.update(name, value, () => {
			// Send notification
			chrome.runtime.sendMessage({action: 'settingsChanged'});
		});
	}

	// Update value without sending a notification
	update(name, value, callback = () => {}) {
		this.s.set(name, value);

		// Update on storage
		let item = {};
		item[name] = value;
		chrome.storage.sync.set(item, callback);
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
			for(const [name, value] of this.s) {
				if(items[name] !== undefined) {
					// Value has already been stored
					this.s.set(name, items[name]);
				} else {
					// New option, add to storage with default value
					this.update(name, value);
				}
			}
			callback();
		});
	}
}
