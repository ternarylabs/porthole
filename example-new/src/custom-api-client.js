	/* http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript */
function guid(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	})
}

var PortholeApi = {
	api_proxy : null,
	api_proxy_ready : null,
	api_root : null,
	_tasked : {},
	init : function(api_root){
		console.log("PortholeApi.init");
		PortholeApi.api_root = api_root ;
		var portholeApiDiv = $('#portholeApiDiv');
			// we use the javascript frame as the guest object.
			// it accomplishes the same as the proxy.html , but has a call back to our javascript in it
			portholeApiDiv.append('<iframe id="portholeApi-frame" name="portholeApi-frame" src="' + PortholeApi.api_root + '/javascript-api-server-framed.html"></iframe>');

		PortholeApi.api_proxy = new Porthole.WindowProxy( PortholeApi.api_root + '/proxy.html', 'portholeApi-frame');
		// Register an event handler to receive messages;

		PortholeApi.api_proxy.addEventListener(PortholeApi.onMessage);
		//PortholeApi.post({'api_function':'is_logged_in','data':{}});

		console.log("// PortholeApi.init");
	},
    ensureProxy :  function(payload,callback) {
    	// payload should be:
    	//		{ 'api_function':'text' , 'post_vars': {} }
    	var queue = true;
    	if ( PortholeApi.api_proxy != null && PortholeApi.api_proxy_ready == true ){ queue = false; }
        if (queue){
            setTimeout(function() {PortholeApi.ensureProxy(payload,callback);}, 1000);
        } else {
        	console.log("PortholeApi.ensureProxy - run it!");
			/* create a guid
				1. assign it into the payload for an echo back
				2. stash it in our _tasked object
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
		if (messageEvent.data == 'READY'){ PortholeApi.api_proxy_ready = true; return; }
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

var PortholeApiWorker = {
	inboundWindowProxy : null ,
	init:function(api_client){
		console.log('PortholeApiWorker.init');
		console.log('PortholeApiWorker.delay this for a bit to simulate a race condition');
		setTimeout(function() {PortholeApiWorker.init_actual(api_client);}, 5000);
	},
	init_actual: function(api_client){
		console.log('PortholeApiWorker.init_actual');
		// set up the proxy
		PortholeApiWorker.inboundWindowProxy = new Porthole.WindowProxy( api_client + "/js/porthole/proxy.html");
		PortholeApiWorker.inboundWindowProxy.addEventListener( PortholeApiWorker.onMessage );
		PortholeApiWorker.inboundWindowProxy.post('READY');
	},
    onMessage : function(messageEvent) {
        console.log("PortholeApiWorker.onMessage");
        console.log(messageEvent) ;
        //
        //
        // you would do your ajax/local-storage work here, now able to hit the API server with javascript and access cookies
        //
        //
        var rval= { 'f' : messageEvent.data.api_function ,
        	'guid' : messageEvent.data.guid,
        	'callback' : messageEvent.data.callback,
        	'response': { status : 'success' ,
				data : 'OK'
			}
		};
		console.log(rval);
		PortholeApiWorker.inboundWindowProxy.post(rval);
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
