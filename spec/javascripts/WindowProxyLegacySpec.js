describe("windowProxyLegacy",
function() {
	var windowProxyLegacy;

	beforeEach(function() {
		windowProxyLegacy = new Porthole.WindowProxyLegacy('http://localhost/proxy.html');
	});

	it("should add an event listener",
	function() {
		var listener = jasmine.createSpy();
		expect(windowProxyLegacy.addEventListener(listener)).toBe(listener);
	});

	it("should remove an event listener",
	function() {
		var listener = jasmine.createSpy();
		windowProxyLegacy.addEventListener(listener);
		windowProxyLegacy.removeEventListener(listener);
	});

	it("should create an iFrame proxy",
	function() {
		element = windowProxyLegacy.createIFrameProxy();
		expect(element.src).toEqual('http://localhost/proxy.html');
	});

	it("should call an event listener",
	function() {
		var listener = jasmine.createSpy();
		windowProxyLegacy.addEventListener(listener);
		windowProxyLegacy.dispatchEvent('event');
		expect(listener).toHaveBeenCalledWith('event');
	});

	it("should call all event listeners even if one throw an exception",
	function() {
		var listener1 = jasmine.createSpy().andThrow("Kaboom");
		windowProxyLegacy.addEventListener(listener1);
		var listener2 = jasmine.createSpy();
		windowProxyLegacy.addEventListener(listener2);
		windowProxyLegacy.dispatchEvent('event');
		expect(listener1).toHaveBeenCalledWith('event');
		expect(listener2).toHaveBeenCalledWith('event');
	});

	it("should post a message on the proxy iframe",
	function() {
		spyOn(windowProxyLegacy, 'getOrigin').andReturn('http://test.server');
		spyOn(windowProxyLegacy.proxyIFrameElement, 'setAttribute');
		windowProxyLegacy.postMessage('message');
		expect(windowProxyLegacy.proxyIFrameElement.setAttribute).toHaveBeenCalledWith('src',
		'http://localhost/proxy.html#message&sourceOrigin=http%3A//test.server&targetOrigin=*&sourceWindowName=' + 
			window.name + '&targetWindowName=');
		expect(windowProxyLegacy.proxyIFrameElement.height).toEqual('100');
	});


});