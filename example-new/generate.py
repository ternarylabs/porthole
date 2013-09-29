# python 2.X script; might work under 3

import os
import shutil

if os.path.exists("./build"):
    shutil.rmtree("./build")
shutil.copytree("./src","./build",symlinks=True)

for i in (1,2,):
    shutil.copytree("./build/domain","./build/domain-%s"%i,symlinks=True)
shutil.rmtree("./build/domain")



DOMAINS = {
    1 : {
        'domain' : 'localhost1.2xlp.com',
        'domain_parent' : 'localhost1.2xlp.com',
        'domain_guest' : 'localhost1.destructuring.net',
        
        
        'domain_api_server' : 'localhost1.destructuring.net',
        'domain_api_client' : 'localhost1.2xlp.com',
    },
    2 : {
        'domain' : 'localhost1.destructuring.net',
        'domain_parent' : 'localhost1.2xlp.com',

        'domain_api_server' : 'localhost1.destructuring.net',
        'domain_api_client' : 'localhost1.2xlp.com',
    },
}

# for each of the various domains, we need to add in the right variables for several files


def replace_contents( filename , i ):
    original = open(filename,'r').read()
    modified = original.replace( "##DOMAIN##" , DOMAINS[i]['domain'] )
    if 'domain_guest' in DOMAINS[i] :
        modified = modified.replace( "##DOMAIN_GUEST##" , DOMAINS[i]['domain_guest'] )
    if 'domain_parent' in DOMAINS[i] :
        modified = modified.replace( "##DOMAIN_PARENT##" , DOMAINS[i]['domain_parent'] )
    if 'domain_api_server' in DOMAINS[i] :
        modified = modified.replace( "##DOMAIN_API_SERVER##" , DOMAINS[i]['domain_api_server'] )
    if 'domain_api_client' in DOMAINS[i] :
        modified = modified.replace( "##DOMAIN_API_CLIENT##" , DOMAINS[i]['domain_api_client'] )

    open(filename,'w').write(modified)

for i in (1,2,):
    print "* Updating proxy.html for domains-%s" % i
    _fname = "./build/domain-%s/proxy.html" % i
    replace_contents( _fname , i )

    print "* Updating index.html for domains-%s" % i
    _fname = "./build/domain-%s/index.html" % i
    replace_contents( _fname , i )

    print "* Updating frame-contents.html for domains-%s" % i
    _fname = "./build/domain-%s/frame-contents.html" % i
    replace_contents( _fname , i )


    print "* Updating javascript-api-client.html for domains-%s" % i
    _fname = "./build/domain-%s/javascript-api-client.html" % i
    replace_contents( _fname , i )

    print "* Updating javascript-api-server-framed.html for domains-%s" % i
    _fname = "./build/domain-%s/javascript-api-server-framed.html" % i
    replace_contents( _fname , i )



print "* Updating nginx.conf"
_fname = "./build/nginx.conf"
original = open(_fname,'r').read()
modified = original.replace( "##PATH##" , os.getcwd() )
for i in (1,2,):
    modified = modified.replace( "##DOMAIN_%s##"%i , DOMAINS[i]['domain'] )
open(_fname,'w').write(modified)
print "\tenter into nginx config:"
print "\t\tinclude %s/build/nginx.conf" % os.getcwd()
print "\tthen do the following commands"
print "\t\tnginx -t"
print "\t\tnginx -HUP ##NGINX_PID##"


