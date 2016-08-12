
var PortholeApiWorker = {
	api_client : null,
	inboundWindowProxy : null ,
	init:function(api_client_fallback){
		console.log('PortholeApiWorker.init');

		// grab the referrer , since that will be our api client.
		// this won't work if they're https though.
		//var url = (window.location != window.parent.location) ? document.referrer: document.location;
		var referrer = document.referrer;
		if (referrer){
			referrer = referrer.match('https?\:\/\/([a-zA-Z0-9\-\.]+)');
			if (referrer[1]){PortholeApiWorker.api_client = referrer[1]}
		}
		if(PortholeApiWorker.api_client == null){ PortholeApiWorker.api_client = api_client_fallback; }

		console.log('PortholeApiWorker.init | api_client = ' + PortholeApiWorker.api_client);

		console.log('PortholeApiWorker.init | delay the api setup to simulate a race condition');
		setTimeout(function() {PortholeApiWorker.init_deferred();}, 5000);
	},
	init_deferred: function(){
		console.log('PortholeApiWorker.init_deferred');
		// set up the proxy
		console.log("PortholeApiWorker.init_deferred - writing the proxy - " + PortholeApiWorker.api_client + '/proxy.html');
		PortholeApiWorker.inboundWindowProxy = new Porthole.WindowProxy( PortholeApiWorker.api_client + "/proxy.html");
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

        // note that we pass back the GUID
        var rval= { 'api_function' : messageEvent.data.api_function ,
        	'guid' : messageEvent.data.guid,
        	'response': { status : 'success' ,
				data : 'OK'
			}
		};
		console.log("PortholeApiWorker.onMessage - returning the following object");
		console.log(rval);
		PortholeApiWorker.inboundWindowProxy.post(rval);
    }

}

