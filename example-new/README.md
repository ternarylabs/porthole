# Building a Test Environment

I needed to do some work on possibly patching porthole; it was too hard to test the package as-is, so I wrote a quick script to generate a custom environment

you can use generate.py to build out your own custom test environment ( ie, if you need to patch )

    vi generate.py
    //edit//
    python generate.py

generate.py does the following:

* clones 'src' to 'build'
* clones 'src/domain' to `domain-1`,2, etc  in 'build' to your specifications
* updates the `nginx.config` file in 'build', so you can just include it.  running the script will give the full path.

I chose nginx because it was really fast to set up.  This could be self-contained with Python's BaseHttpServer, but I wanted something fast.

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

This way you can do any tests you want locally, without having to set up your own domains


# New Example - Cross Domain AJAX

after setting things up, visit http://localhost1.2xlp.com/porthole-demo/javascript-api-client.html

The following is a narrative example of what is going on.

I've made extensive use of console.log, so you can view the console and see exactly how things go.

Just to be clear about some terminology , which can be confusing

http://localhost1.2xlp.com/porthole-demo/javascript-api-client.html

	the PARENT web page
	the API CLIENT
	think: A page with a Facebook Like Button on it

http://localhost1.destructuring.net/porthole-demo/javascript-api-server-framed.html

	the included FRAME
	the API SERVER
	think: an API network, like Facebook.com


## javascript-api-client.html

1. includes a few files , all off the "API" domain

 * jquery.js (makes the example easier)
 * custom-api-client.js -- our sample API

2. has a DOM element "#portholeApiDiv"

3. on document.ready() , calls the following functions defined in `custom-api.js`

 *  `PortholeApi.init()` , passing in the "api" location
 *  `test()` , run our test function

## custom-api-client.js -- PARENT Include

1. `PortholeApi.init`

 * injects into the DOM ( under `#portholeApiDiv` ) the following:

  1. `javascript-frame.html` -- off the API domain
  2. `porthole.js` -- off the API domain

 * defers additional setup to `_init_ensured` , to be run after the Porthole has been loaded
    1. creates a new outbound proxy
    2. adds an event listener


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
 * custom-api-server.js -- our sample API worker

2. on document.ready() , calls the following functions defined in `custom-api.js`

 *  `PortholeApiWorker.init()` , passing in the "client" location


## custom-api-server.js -- FRAME Include

1. `PortholeApiWorker.init`
 * figures out who the client domain is , based on the referer for the iframe. loads a proxy.html off that domain.
 * delays actually setting things up for 5 seconds.  this simulates a race condition

2. `PortholeApiWorker.init_actual`

 * sets up an inbound proxy window, originating on the API's CLIENT domain
 * adds an event listener to handle the messages
 * posts "READY" to the Client


## custom-api-client.js -- PARENT Include

 * receives the "READY" response, and sets the internal "ready" marker
 * ensureProxy eventually fires (via the settimeout) , we lookup the callback for the GUID and then fire it off
 * our test_return finally fires


