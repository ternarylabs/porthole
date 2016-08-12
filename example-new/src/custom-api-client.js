/* http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript */
function guid(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	})
}

var PortholeApi = {
	api_proxy : null,	// stash the window proxy
	api_proxy_ready : null, 	// flag to test if the window proxy is ready or not
	api_root : null, // where is the api root?

	_tasked : {},
	init : function(api_root){
		console.log("PortholeApi.init");
		console.log("PortholeApi.init - We inject the porthole.js and iframe into the DOM");

		// override the api root
		if (typeof(api_root)!='undefined'){ PortholeApi.api_root = api_root; }

		var portholeApiDiv = $('#portholeApiDiv');

			// write in the porthole javascript item.
			console.log("PortholeApi.init - writing the porthole.js - " + PortholeApi.api_root + '/porthole.js');
			var script = document.createElement("script");
				script.type = "text/javascript";
				script.src = PortholeApi.api_root + '/porthole.js';
			document.getElementById('portholeApiDiv').appendChild(script);

			// we use the javascript frame as the guest object.
			// it accomplishes the same as the proxy.html , but has a call back to our javascript in it
			console.log("PortholeApi.init - writing the iframe - " + PortholeApi.api_root + '/javascript-api-server-framed.html');
			portholeApiDiv.append('<iframe id="portholeApi-frame" name="portholeApi-frame" src="' + PortholeApi.api_root + '/javascript-api-server-framed.html"></iframe>');

		console.log("PortholeApi.init - we may not have the Porthole JS loaded yet, so let's defer the WindowProxy setup...");
		setTimeout(function() {PortholeApi._init_ensured();}, 100);
	},
	_init_ensured : function() {
		console.log('PortholeApi._init_ensured()');
		if (!window.Porthole){
			console.log('PortholeApi._init_ensured(not ready yet)');
			setTimeout(function() {PortholeApi._init_ensured();}, 100);
			return;
		}
		console.log('PortholeApi._init_ensured(ready!)');

		console.log("PortholeApi._init_ensured - setting up the window proxy");
		PortholeApi.api_proxy = new Porthole.WindowProxy( PortholeApi.api_root + '/proxy.html', 'portholeApi-frame');
		// Register an event handler to receive messages;

		PortholeApi.api_proxy.addEventListener(PortholeApi.onMessage);

		// if we wanted to do an OnLoad api check, we could could call it here
		// PortholeApi.ensureProxy( {'api_function':'is_logged_in', 'post_vars':{} } , test_return );

		console.log("PortholeApi._init_ensured - done");
	},
    ensureProxy :  function(payload,callback) {
    	// payload should be:
    	//		{ 'api_function':'text' , 'post_vars': {} }
		console.log("PortholeApi.ensureProxy");
		console.log("PortholeApi.ensureProxy - We want to ensure that we have a windowProxy and it is ready");
    	var queue = true;
    	if ( PortholeApi.api_proxy != null && PortholeApi.api_proxy_ready == true ){ queue = false; }
        if (queue){
			console.log("PortholeApi.ensureProxy - WindowProxy is not ready yet");
            setTimeout(function() {PortholeApi.ensureProxy(payload,callback);}, 500);
        } else {
        	console.log("PortholeApi.ensureProxy - WindowProxy ready. GO!");
			/* create a guid
				1. assign it into the payload for an echo back
				2. stash it in our _tasked object
				this allows us to map returned data , since all this happens asynchronously
			*/
			var _guid = guid();
				payload.guid = _guid;
			PortholeApi._tasked[_guid] = callback ;
            PortholeApi.api_proxy.post(payload);
        }
	},
	onMessage : function(messageEvent){
		/*
			messageEvent.origin: Protocol and domain origin of the message
			messageEvent.data: Message itself
			messageEvent.source: Window proxy object, useful to post a response
		-- custom below --
			messageEvent.data.response: raw response from API on the other side
		*/
		if (messageEvent.data == 'READY'){
        	console.log("PortholeApi.onMessage - inbound READY received");
			PortholeApi.api_proxy_ready = true; return;
		}
		console.log('------------------ PortholeApi.onMessage || RECEIVED');
		console.log('messageEvent');
		console.log(messageEvent);
		var _guid = messageEvent.data.guid ;
		var callback = PortholeApi._tasked[_guid];
		console.log( callback )
		delete PortholeApi._tasked[_guid];
		callback( messageEvent.data.response , callback );
		console.log('------------------ PortholeApi.onMessage || DONE' );
	}
}


function test(){
	console.log('test');
	PortholeApi.ensureProxy( {'api_function':'is_logged_in', 'post_vars':{} } , test_return );
}

function test_return(payload){
	console.log('test_return');
	console.log(payload)
}
