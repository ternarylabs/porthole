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

this way you can do any tests you want locally, without installing somewhere
