describe("WindowProxy", function() {
  var windowProxy;

  beforeEach(function() {
    windowProxy = new Porthole.WindowProxy('http://localhost/proxy.html');
  });

  it("should create an iFrame proxy", function() {
    element = windowProxy.createIFrameProxy();
    expect(element.src).toEqual('http://localhost/proxy.html');
  });

  it("should add an event listener", function() {
		var listener = jasmine.createSpy();
		expect(windowProxy.eventListeners.length).toEqual(0);
    expect(windowProxy.addEventListener(listener)).toBe(listener);
		expect(windowProxy.eventListeners.length).toEqual(1);
  });

  it("should remove an event listener", function() {
		var listener = jasmine.createSpy();
		expect(windowProxy.eventListeners.length).toEqual(0);
    windowProxy.addEventListener(listener);
		expect(windowProxy.eventListeners.length).toEqual(1);
    windowProxy.removeEventListener(listener);
		expect(windowProxy.eventListeners.length).toEqual(0);
  });

  it("should call an event listener", function() {
		var listener = jasmine.createSpy();
    windowProxy.addEventListener(listener);
    windowProxy.onMessageEvent('event');
    expect(listener).toHaveBeenCalledWith('event');
  });

  it("should call all event listeners even if one throw an exception", function() {
		var listener1 = jasmine.createSpy().andThrow("Kaboom");
    windowProxy.addEventListener(listener1);
		var listener2 = jasmine.createSpy();
    windowProxy.addEventListener(listener2);
    windowProxy.onMessageEvent('event');
    expect(listener1).toHaveBeenCalledWith('event');
    expect(listener2).toHaveBeenCalledWith('event');
  });

  it("should post a message on the proxy iframe", function() {
		spyOn(windowProxy, 'getOrigin').andReturn('http://test.server');
		spyOn(windowProxy.proxyIFrameElement, 'setAttribute');
		windowProxy.postMessage('message');
		expect(windowProxy.proxyIFrameElement.setAttribute).toHaveBeenCalledWith('src', 
			'http://localhost/proxy.html#message&sourceOrigin=http%3A//test.server&targetOrigin=*&sourceWindowName='+ window.name + '&targetWindowName=');
		expect(windowProxy.proxyIFrameElement.height).toEqual('100');
  });

	it("should split no message", function() {
		expect(Porthole.WindowProxy.splitMessageParameters()).toEqual(null);
	});

	it("should split null message", function() {
		expect(Porthole.WindowProxy.splitMessageParameters(null)).toEqual(null);
	});

	it("should split an empty message", function() {
		expect(Porthole.WindowProxy.splitMessageParameters('').length).toEqual(0);
	});

	it("should split a valid message", function() {
		expect(Porthole.WindowProxy.splitMessageParameters("param=value")).toEqual({'param':'value'});
		expect(Porthole.WindowProxy.splitMessageParameters("foo=1&bar=2")).toEqual({'foo':'1','bar':'2'});
		expect(Porthole.WindowProxy.splitMessageParameters("foo=1&bar")).toEqual({'foo':'1','bar':''});
	});

});