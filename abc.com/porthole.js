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

var Porthole = (typeof Porthole == "undefined") || !Porthole ? {} : Porthole;

function trace(s) {
  try { console.log(s) } catch (e) { }
};

/*
	Create a proxy window to post messages to target window
*/
Porthole.WindowProxy = function WindowProxy(proxyIFrameUrl, targetWindowName) {
	if (targetWindowName == null) {
		targetWindowName = '';
	}
	this.targetWindowName = targetWindowName;

	this.eventListeners = [];
	this.origin = window.location.protocol + '//' + window.location.host
	if (proxyIFrameUrl != null) {	
		this.proxyIFrameName = this.targetWindowName + 'ProxyIFrame';
		this.proxyIFrameLocation = proxyIFrameUrl;

		// Create the proxy iFrame and add to dom
		this.proxyIFrameElement = this.createIFrameProxy();
	} else {
		// Won't be able to send messages
		this.proxyIFrameElement = null;
	}
}

Porthole.WindowProxy.prototype = {
	/*
		Create an iframe and load the proxy
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
	
	/* 
		Post a message to the target window only if the content comes from the target origin
	*/
	postMessage: function(data, targetOrigin) {
		if (targetOrigin == null) {
			targetOrigin = '*';
		}
		if (this.proxyIFrameElement == null) {
			console.error("Can't send message because no proxy url was passed in the constructor");
		} else {
			sourceWindowName = window.name;
			this.proxyIFrameElement.setAttribute('src', this.proxyIFrameLocation + '#' + data +
				'&sourceOrigin=' + escape(this.origin) + 
				'&targetOrigin=' + escape(targetOrigin) + 
				'&sourceWindowName=' + sourceWindowName + 
				'&targetWindowName=' + this.targetWindowName);
			this.proxyIFrameElement.height = this.proxyIFrameElement.height > 50 ? 50 : 100;
		}
	},

	addEventListener: function(f) {
		this.eventListeners.push(f);
	},

	removeEventListener: function(f) {
		this.eventListeners = this.eventListeners.splice(this.eventListeners.indexOf(f), 1);
	},

	onMessageEvent: function(e) {
		for (var i = 0; i < this.eventListeners.length; i++) {
			try {
	    	this.eventListeners[i](e);
			} catch(ex) {
				console.error("Exception trying to call back listener: " + ex);
			}
	  }
	}
};
/* 
	Convinience method to split a message of type param=value&param2=value2
	and return an array such as ['param':value, 'param2':value2]
*/
Porthole.WindowProxy.splitMessageParameters = function(message) {
	var hash = new Array();
	var pairs = message.split(/&/);
	for (var keyValuePairIndex in pairs) {
		var nameValue = pairs[keyValuePairIndex].split(/=/);
		if (typeof(nameValue[1]) == 'undefined') {
			hash[nameValue[0]] = '';
		} else {
			hash[nameValue[0]] = nameValue[1];
		}
	}
	return hash;
}


Porthole.MessageEvent = function MessageEvent(data, origin, source) {
	this.data = data;
	this.origin = origin;
	this.source = source;
}


/*
	Dispatch event messages to the correct target window
*/
Porthole.WindowProxyDispatcher = {
/*
		Forward a message event to the target window
*/
	forwardMessageEvent: function(e) {
		trace("Porthole.WindowProxyDispatcher.forwardMessageEvent");
		var message = document.location.hash;
		if (message.length > 0) {
			// Eat the hash character
			message = message.substr(1);
		
			m = Porthole.WindowProxyDispatcher.parseMessage(message);

			if (m.targetWindowName == '') {
				targetWindow = top;
			} else {
				targetWindow = parent.frames[m.targetWindowName];
			}
		
			var windowProxy = Porthole.WindowProxyDispatcher.findWindowProxyObjectInWindow(targetWindow, m.sourceWindowName);

			if (windowProxy) {
				if (windowProxy.origin == m.targetOrigin || m.targetOrigin == '*') {
					e = new Porthole.MessageEvent(m.data, m.sourceOrigin, windowProxy);
					windowProxy.onMessageEvent(e);
				} else {
					console.error("Target origin " + windowProxy.origin + " does not match desired target of " + m.targetOrigin);
				}
			} else {
				console.error("Could not find window proxy object on the target window");
			}
		}
	},

	parseMessage: function(message) {
		params = Porthole.WindowProxy.splitMessageParameters(message);
		var h = {targetOrigin:'', sourceOrigin:'', sourceWindowName:'', data:''};
		h.targetOrigin = unescape(params['targetOrigin']);
		h.sourceOrigin = unescape(params['sourceOrigin']);
		h.sourceWindowName = unescape(params['sourceWindowName']);
		h.targetWindowName = unescape(params['targetWindowName']);
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
	
/*
		Look for a window proxy object in the target window
*/
	findWindowProxyObjectInWindow: function(w, sourceWindowName) {
		trace("Porthole.WindowProxyDispatcher.findWindowProxyObjectInWindow");
		// IE does not enumerate global objects on the window object
		if (w.RuntimeObject) {
			w = w.RuntimeObject();
		}
		if (w) {
			for (var i in w) { 
				try {
					// Ensure that we're finding the proxy object that is declared to be targetting the window that is calling us
					if (w[i] != null && typeof(w[i]) == "object" && w[i].targetWindowName == sourceWindowName) { 
						return w[i];
					}
				} catch(e) {
					console.error("Can't access object: " + i);
				}
			}
		}
		return null;
	},

	start: function() {
		if (window.addEventListener) {
			window.addEventListener('resize', Porthole.WindowProxyDispatcher.forwardMessageEvent, false); 
		} else if (document.body.attachEvent) {
			window.attachEvent('onresize', Porthole.WindowProxyDispatcher.forwardMessageEvent);
		} else {
			// Should never happen
			console.error("Can't attach resize event");
		}
	}
};
