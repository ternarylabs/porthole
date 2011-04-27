if (typeof window.postMessage == 'function') {

describe("WindowProxyHTML5", function() {
  var windowProxyHTML5;

  beforeEach(function() {
    windowProxyHTML5 = new Porthole.WindowProxyHTML5();
  });

  it("should add an event listener", function() {
		var listener = jasmine.createSpy();
    expect(windowProxyHTML5.addEventListener(listener)).toBe(listener);
  });

  it("should remove an event listener", function() {
		var listener = jasmine.createSpy();
    windowProxyHTML5.addEventListener(listener);
    windowProxyHTML5.removeEventListener(listener);
  });

  it("should call an event listener", function() {
		var verifyEvent = function(e) {
			expect(e.data).toEqual('event');
			expect(e.origin).toEqual('origin');
			expect(e.source).toEqual(window);
		}
		var listener = jasmine.createSpy('listener').andCallFake(verifyEvent);
    windowProxyHTML5.addEventListener(listener);
		var e = new Porthole.MessageEvent('event', 'origin', null);
    windowProxyHTML5.dispatchEvent(e);
    expect(listener).toHaveBeenCalled();
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

}