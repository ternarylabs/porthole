Porthole is a small library to enable secure cross-domain iFrame communication.

## Usage

Include the javascript.

	<script type="text/javascript" src="http://sandbox.ternarylabs.com/porthole/js/porthole.js"></script>

Create your content iFrame. This is where the guest content lives. Make sure to give it a name.
	<iframe id="guestFrame" name="guestFrame" width="500px" height="150px" frameborder="1" src="http://demo.auberger.com/porthole/" scrolling="no"></iframe>

Define an event handler if you want to receive messages.

	function onMessage(messageEvent) {  
		/*
			messageEvent contains the following properties:
			
			messageEvent.origin: Protocol and domain origin of the message
			messageEvent.data: Message itself
			messageEvent.source: Window proxy object, usefull to post a response 
		*/
	}

Create a window proxy object.

	var windowProxy;
	window.onload=function(){ 
		// Create a proxy window to send to and receive message from the guest iframe
		windowProxy = new Porthole.WindowProxy('http://demo.auberger.com/porthole/proxy.html', 'guestFrame');

		// Register an event handler to receive messages;
		windowProxy.addEventListener(onMessage);
	};