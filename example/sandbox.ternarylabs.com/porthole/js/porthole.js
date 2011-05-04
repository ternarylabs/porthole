/*
	Copyright (c) 2011 Ternary Labs. All Rights Reserved.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/**
	* @fileOverview Porthole, a small library for secure cross-domain iFrame communication.
	* @author <a href="mailto:georges@ternarylabs.com">Georges Auberger</a>
	*/

/*
# Websequencediagrams.com
participant abc.com
participant "iFrame proxy xyz.com"
participant "iFrame proxy abc.com"
participant "iFrame xyz.com"
abc.com->iFrame proxy xyz.com: postMessage(data, targetOrigin)
note left of "iFrame proxy xyz.com": Set url fragment and change size
iFrame proxy xyz.com->iFrame proxy xyz.com: onResize Event
note right of "iFrame proxy xyz.com": read url fragment
iFrame proxy xyz.com->iFrame xyz.com: forwardMessageEvent(event)
iFrame xyz.com->iFrame proxy abc.com: postMessage(data, targetOrigin)
note right of "iFrame proxy abc.com": Set url fragment and change size
iFrame proxy abc.com->iFrame proxy abc.com: onResize Event
note right of "iFrame proxy abc.com": read url fragment
iFrame proxy abc.com->abc.com: forwardMessageEvent(event)
*/

/**
 * Namespace for Porthole, a small library for secure cross-domain iFrame communication.
 */
var Porthole = (typeof Porthole == "undefined") || !Porthole ? {} : Porthole;

Porthole = {
	/**
	 * Utility function to output to console
	 * @private
	 */
	trace: function(s) {
	  try { console.log("Porthole: " + s); } catch (e) { }
	},

	/**
	 * Utility function to output to console
	 * @private
	 */
	error: function(s) {
	  try { console.error("Porthole: " + s); } catch (e) { }
	}
};
/**
 * Proxy window object to post message to target window
 *
 * @constructor
 * @param proxyIFrameUrl
 * @param targetWindowName
 */
Porthole.WindowProxy = function(){};

Porthole.WindowProxy.prototype = {
/**
 * Post a message to the target window only if the content comes from the target origin.
 * <code>targetOrigin</code> can be a url or *
 * @public
 * @param {String} data
 * @param {String} targetOrigin
 */
	postMessage : function() {},
/**
 * Add an event listener to receive messages.
 * @public
 * @param {Function} eventListenerCallback
 * @returns {Function} eventListenerCallback
 */
	addEventListener: function(f) {},
/**
 * Remove an event listener.
 * @public
 * @param {Function} eventListenerCallback
 */
	removeEventListener: function(f) {}
};

/**
 * Legacy browser implementation of proxy window object to post message to target window
 *
 * @private
 * @constructor
 * @param proxyIFrameUrl
 * @param targetWindowName
 */
Porthole.WindowProxyLegacy = function(proxyIFrameUrl, targetWindowName) {
	if (targetWindowName === undefined) {
		targetWindowName = '';
	}
	this.targetWindowName = targetWindowName;

	this.eventListeners = [];
	this.origin = window.location.protocol + '//' + window.location.host;
	if (proxyIFrameUrl !== null) {	
		this.proxyIFrameName = this.targetWindowName + 'ProxyIFrame';
		this.proxyIFrameLocation = proxyIFrameUrl;

		// Create the proxy iFrame and add to dom
		this.proxyIFrameElement = this.createIFrameProxy();
	} else {
		// Won't be able to send messages
		this.proxyIFrameElement = null;
	}
};

Porthole.WindowProxyLegacy.prototype = {
	getTargetWindowName: function() {
		return this.targetWindowName;
	},
	
	getOrigin: function() {
		return this.origin;
	},
	
	/**
	 * Create an iframe and load the proxy
	 *
	 * @private
	 * @returns iframe
	 */
	createIFrameProxy: function() {
		var iframe = document.createElement("iframe");
		iframe.setAttribute('id', this.proxyIFrameName);
		iframe.setAttribute('name', this.proxyIFrameName);
		iframe.setAttribute('src', this.proxyIFrameLocation);
		iframe.setAttribute('frameBorder', '1'); // IE needs this otherwise resize event is not fired
		iframe.setAttribute('scrolling', 'auto');
		iframe.setAttribute('width', 30);	// Need a certain size othwerise IE7 does not fire resize event
		iframe.setAttribute('height', 30);
		iframe.setAttribute('style', "position: absolute; left: -100px; top:0px;");
		// IE needs this because setting style attribute is broken. No really.
		if (iframe.style.setAttribute) {
			iframe.style.setAttribute('cssText', "position: absolute; left: -100px; top:0px;");
		}
		document.body.appendChild(iframe);
		return iframe;
	},
	
	postMessage: function(data, targetOrigin) {
		if (targetOrigin === undefined) {
			targetOrigin = '*';
		}
		if (this.proxyIFrameElement === null) {
			Porthole.error("Can't send message because no proxy url was passed in the constructor");
		} else {
			sourceWindowName = window.name;
			this.proxyIFrameElement.setAttribute('src', this.proxyIFrameLocation + '#' + data +
				'&sourceOrigin=' + escape(this.getOrigin()) + 
				'&targetOrigin=' + escape(targetOrigin) + 
				'&sourceWindowName=' + sourceWindowName + 
				'&targetWindowName=' + this.targetWindowName);
			this.proxyIFrameElement.height = this.proxyIFrameElement.height > 50 ? 50 : 100;
		}
	},

	addEventListener: function(f) {
		this.eventListeners.push(f);
		return f;
	},

	removeEventListener: function(f) {
		try {
			var index = this.eventListeners.indexOf(f);
			this.eventListeners.splice(index, 1);
		} catch(e) {
			this.eventListeners = [];
			Porthole.error(e);
		}
	},

	dispatchEvent: function(e) {
		for (var i = 0; i < this.eventListeners.length; i++) {
			try {
				this.eventListeners[i](e);
			} catch(ex) {
				Porthole.error("Exception trying to call back listener: " + ex);
			}
	  }
	}
};

/**
	* Implementation for modern browsers that supports it
	*/
Porthole.WindowProxyHTML5 = function(proxyIFrameUrl, targetWindowName) {
	if (targetWindowName === undefined) {
		targetWindowName = '';
	}
	this.targetWindowName = targetWindowName;
};

Porthole.WindowProxyHTML5.prototype = {
	postMessage: function(data, targetOrigin) {
		if (targetOrigin === undefined) {
			targetOrigin = '*';
		}
		
		// Lookup window object from target window name
		if (this.targetWindowName === '') {
			targetWindow = top;
		} else {
			targetWindow = parent.frames[this.targetWindowName];
		}
		targetWindow.postMessage(data, targetOrigin);
	},
	addEventListener: function(f) {
		window.addEventListener("message", f, false);
		return f;
	},
	removeEventListener: function(f) {
		window.removeEventListener("message", f, false);
	},
	dispatchEvent: function(e) {
		var evt = document.createEvent("MessageEvent");
		evt.initMessageEvent("message", true, true, e.data, e.origin, 1, window, null);
		window.dispatchEvent(evt);
	}
};

if (typeof window.postMessage != 'function') {
	Porthole.trace("Using legacy browser support");
	Porthole.WindowProxy = Porthole.WindowProxyLegacy;
	Porthole.WindowProxy.prototype = Porthole.WindowProxyLegacy.prototype;
} else {
	Porthole.trace("Using built-in browser support");
	Porthole.WindowProxy = Porthole.WindowProxyHTML5;
	Porthole.WindowProxy.prototype = Porthole.WindowProxyHTML5.prototype;
}

/**
	* Convinience method to split a message of type param=value&param2=value2
	* and return an array such as ['param':value, 'param2':value2]
	*
	* @param {String} message
	* @returns {Array} key value pair array
	*/
Porthole.WindowProxy.splitMessageParameters = function(message) {
	if (typeof message == 'undefined' || message === null) {
		return null;
	}
	var hash = [];
	var pairs = message.split(/&/);
	for (var keyValuePairIndex in pairs) {
		var nameValue = pairs[keyValuePairIndex].split('=');
		if (typeof(nameValue[1]) == 'undefined') {
			hash[nameValue[0]] = '';
		} else {
			hash[nameValue[0]] = nameValue[1];
		}
	}
	return hash;
};

/**
	* Event object to be passed to registered event handlers
	* @param {String} data
	* @param {String} origin url of window sending the message
	* @param {Object} source window object sending the message
	*/
Porthole.MessageEvent = function MessageEvent(data, origin, source) {
	this.data = data;
	this.origin = origin;
	this.source = source;
};

/**
	* Dispatcher object to relay messages.
	* @public
	* @constructor
	*/
Porthole.WindowProxyDispatcher = {
	/**
		* Forward a message event to the target window
		* @private
		*/
	forwardMessageEvent: function(e) {
		var message = document.location.hash;
		if (message.length > 0) {
			// Eat the hash character
			message = message.substr(1);
		
			m = Porthole.WindowProxyDispatcher.parseMessage(message);

			if (m.targetWindowName === '') {
				targetWindow = top;
			} else {
				targetWindow = parent.frames[m.targetWindowName];
			}
		
			var windowProxy = Porthole.WindowProxyDispatcher.findWindowProxyObjectInWindow(targetWindow, m.sourceWindowName);

			if (windowProxy) {
				if (windowProxy.origin == m.targetOrigin || m.targetOrigin == '*') {
					e = new Porthole.MessageEvent(m.data, m.sourceOrigin, windowProxy);
					windowProxy.dispatchEvent(e);
				} else {
					Porthole.error("Target origin " + windowProxy.origin + " does not match desired target of " + m.targetOrigin);
				}
			} else {
				Porthole.error("Could not find window proxy object on the target window");
			}
		}
	},

	parseMessage: function(message) {
		if (typeof message == 'undefined' || message === null) {
			return null;
		}
		params = Porthole.WindowProxy.splitMessageParameters(message);
		var h = {targetOrigin:'', sourceOrigin:'', sourceWindowName:'', data:''};
		h.targetOrigin = unescape(params.targetOrigin);
		h.sourceOrigin = unescape(params.sourceOrigin);
		h.sourceWindowName = unescape(params.sourceWindowName);
		h.targetWindowName = unescape(params.targetWindowName);
		var d = message.split(/&/);
		if (d.length > 3) {
			d.pop();
			d.pop();
			d.pop();
			d.pop();
			h.data = d.join('&');
		}
		return h;
	},
	
	/**
		* Look for a window proxy object in the target window
		* @private
		*/
	findWindowProxyObjectInWindow: function(w, sourceWindowName) {
		// IE does not enumerate global objects on the window object
		if (w.RuntimeObject) {
			w = w.RuntimeObject();
		}
		if (w) {
			for (var i in w) { 
				try {
					// Ensure that we're finding the proxy object that is declared to be targetting the window that is calling us
					if (w[i] !== null && typeof w[i] == "object" && w[i] instanceof w.Porthole.WindowProxy && 
								w[i].getTargetWindowName() == sourceWindowName) { 
						return w[i];
					}
				} catch(e) {
					// Swallow exception in case we access an object we shouldn't
				}
			}
		}
		return null;
	},
	
	/**
	 * Start a proxy to relay messages.
	 * @public
	 */
	start: function() {
		if (window.addEventListener) {
			window.addEventListener('resize', Porthole.WindowProxyDispatcher.forwardMessageEvent, false); 
		} else if (document.body.attachEvent) {
			window.attachEvent('onresize', Porthole.WindowProxyDispatcher.forwardMessageEvent);
		} else {
			// Should never happen
			Porthole.error("Can't attach resize event");
		}
	}
};
