describe("WindowProxyDispatcher", function() {
  beforeEach(function() {
  });

  it("should start", function() {
		if (window.addEventListener) {
			spyOn(window, 'addEventListener');
		} else {
			spyOn(window, 'attachEvent');
		}
		Porthole.WindowProxyDispatcher.start();
		if (window.addEventListener) {
    	expect(window.addEventListener).toHaveBeenCalled();
		} else {
    	expect(window.attachEvent).toHaveBeenCalled();
		}
  });

  it("should find window proxy object", function() {
		unauthorized = new Porthole.WindowProxyLegacy('', '');
		spyOn(unauthorized, 'getTargetWindowName').andThrow("unauthorized access");
		wrongWindowProxy = new Porthole.WindowProxyLegacy('', 'SomeOtherWindow');
		targetWindowProxy = new Porthole.WindowProxyLegacy('', 'SourceWindowName');
		fakeWindowObject = [ unauthorized, wrongWindowProxy, targetWindowProxy ];
		fakeWindowObject.Porthole = { 'WindowProxy' : Porthole.WindowProxyLegacy};
		o = Porthole.WindowProxyDispatcher.findWindowProxyObjectInWindow(fakeWindowObject, 'SourceWindowName');
    expect(o).toEqual(targetWindowProxy);
  });

  it("should parse no message", function() {
		expect(Porthole.WindowProxyDispatcher.parseMessage()).toEqual(null);
	});

  it("should parse a null message", function() {
		expect(Porthole.WindowProxyDispatcher.parseMessage(null)).toEqual(null);
	});

  it("should parse a valid message", function() {
		expect(Porthole.WindowProxyDispatcher.parseMessage(
			'param=value&message&sourceOrigin=http%3A//localhost%3A8888&targetOrigin=*&sourceWindowName=a&targetWindowName=b')).toEqual(
				 { 
					targetOrigin : '*', 
					sourceOrigin : 'http://localhost:8888', 
					sourceWindowName : 'a', 
					data : 'param=value&message', 
					targetWindowName : 'b' 
					}
				);
	});
	
});