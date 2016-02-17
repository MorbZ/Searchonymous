const {Cc, Ci} = require("chrome");

const observer_topic = "http-on-modify-request";
let observer = null;

// Create observer
function createObserver(callback) {
	observer = {
		observe: function(subject, topic, data)
		{
			if(topic == observer_topic) {
				var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
				if(httpChannel != null && httpChannel.getRequestHeader != undefined) {
					callback(httpChannel);
				}
			}
		}
	}
}
exports.createObserver = createObserver;

// Register observer
function register()
{
	getObserverService().addObserver(observer, observer_topic, false);
}
exports.register = register;

// Unregister observer
function unregister()
{
	getObserverService().removeObserver(observer, observer_topic);
}
exports.unregister = unregister;

// Get observer service
function getObserverService() {
	return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
}
