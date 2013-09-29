# Building a Test Environment

I needed to do some work on possibly patching porthole; it was too hard to test the package as-is, so I wrote a quick script to generate a custom environment

you can use generate.py to build out your own custom test environment ( ie, if you need to patch )

generate.py does the following:

* clones 'src' to 'build'
* clones 'src/domain' to `domain-1`,2, etc  in 'build' to your specifications
* updates the `nginx.config` file in 'build', so you can just include it.  running the script will give the full path.

A few notes on the setup

* All .js is served from the 'domain_parent'
* .js uses the non-minified version, so you can debug
* .js uses symlinks to point to a single, active version, in /src
* server files point to DOMAIN/porthole-demo/
* nginx is set to alias DOMAIN/porthole-demo/ as well ( this way you can have other stuff running on whatever domains , if needed )


for a basic setup, integrating into nginx is simply just adding 1 line into the server:

	http {
		...
		include .../example-new/build/nginx.conf
		...
	}

After updating the nginx file, please remember to:

	1. Test NGINX
		nginx -t

	1. Restart NGINX
		kill -HUP ##NGINX_PID##


For your convenience, I've also set up DNS as follows:

* localhost1.2xlp.com -> 127.0.0.1
* localhost2.2xlp.com -> 127.0.0.1
* localhost3.2xlp.com -> 127.0.0.1
* localhost4.2xlp.com -> 127.0.0.1
* localhost1.destructuring.net -> 127.0.0.1
* localhost2.destructuring.net -> 127.0.0.1
* localhost3.destructuring.net -> 127.0.0.1
* localhost4.destructuring.net -> 127.0.0.1

this way you can do any tests you want locally, without installing somewhere


# New Example - Cross Domain AJAX

after setting things up, visit http://localhost1.2xlp.com/porthole-demo/javascript-api-client.html

here's a narrative example of what is going on:

## javascript-api-client.html

1. includes a few files , all off the "API" domain

 * porthole.js
 * jquery.js (makes the example easier)
 * custom-api.js -- our sample API

2. has a DOM element "#portholeApiDiv"

3. on document.ready() , calls the following functions defined in `custom-api.js`

 *  `PortholeApi.init()` , passing in the "api" location
 *  `test()` , run our test function

## custom-api.js -- PARENT Include

1. `PortholeApi.init`

 * injects into the DOM ( under `#portholeApiDiv` ) the following:

  2. `javascript-frame.html` -- off the api domain

 * creates a new outbound proxy
 * adds an event listener


2. `PortholeApi.ensureProxy`

 * expects a `payload` to proxy to the guest domain, + a `callback`
 * ensures we have an active proxy defined, if not, we settimeout for a second
 * we create a GUID for the action and store it locally, along with the callback.  this lets us process thigns later


3. `PortholeApi.onMessage`

 * expects a `messageEvent` from Porthole.js
 * if the `messageEvent` data is just "ready", we note that the proxy is ready, and exit
 * otherwise, we figure out the callback and run it


## javascript-api-server-framed.html -- FRAME

1. includes a few files , all off the "API" domain

 * porthole.js
 * jquery.js (makes the example easier)
 * custom-api.js -- our sample API

2. on document.ready() , calls the following functions defined in `custom-api.js`

 *  `PortholeApiWorker.init()` , passing in the "client" location


## custom-api.js -- API Include

1. `PortholeApiWorker.init`

 * delays actually setting things up for 5 seconds.  this simulates a race condition

2. `PortholeApiWorker.init_actual`

 * sets up an inbound proxy window, originating on the API's CLIENT domain
 * adds an event listener to handle the messages
 * posts "READY" to the Client


## custom-api.js -- PARENT Include

 * receives the "READY" response, and sets the internal "ready" marker
 * ensureProxy eventually fires (via the settimeout) , we lookup the callback for the GUID and then fire it off
 * our test_return finally fires


