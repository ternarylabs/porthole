describe("WindowProxy",
function() {
	var windowProxy;

	beforeEach(function() {
		windowProxy = new Porthole.WindowProxy('http://localhost/proxy.html');
	});

	it("should add an event listener",
	function() {
		var listener = jasmine.createSpy();
		expect(windowProxy.addEventListener(listener)).toBe(listener);
	});

	it("should remove an event listener",
	function() {
		var listener = jasmine.createSpy();
		windowProxy.addEventListener(listener);
		windowProxy.removeEventListener(listener);
	});

	it("should call an event listener",
	function() {
		var verifyEvent = function(e) {
			expect(e.data).toEqual('event');
			expect(e.origin).toEqual('origin');
		};
		var listener = jasmine.createSpy('listener').andCallFake(verifyEvent);
		windowProxy.addEventListener(listener);
		var e = new Porthole.MessageEvent('event', 'origin', null);
		windowProxy.dispatchEvent(e);
		expect(listener).toHaveBeenCalled();
	});

	it("should split no message",
	function() {
		expect(Porthole.WindowProxy.splitMessageParameters()).toEqual(null);
	});

	it("should split null message",
	function() {
		expect(Porthole.WindowProxy.splitMessageParameters(null)).toEqual(null);
	});

	it("should split an empty message",
	function() {
		expect(Porthole.WindowProxy.splitMessageParameters('').length).toEqual(0);
	});

	it("should split a valid message",
	function() {
		expect(Porthole.WindowProxy.splitMessageParameters("param=value")).toEqual({
			'param': 'value'
		});
		expect(Porthole.WindowProxy.splitMessageParameters("foo=1&bar=2")).toEqual({
			'foo': '1',
			'bar': '2'
		});
		expect(Porthole.WindowProxy.splitMessageParameters("foo=1&bar")).toEqual({
			'foo': '1',
			'bar': ''
		});
	});

});