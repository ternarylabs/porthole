describe("WindowProxyDispatcher", function() {
  beforeEach(function() {
  });

  it("should start", function() {
		spyOn(window, 'addEventListener');
		Porthole.WindowProxyDispatcher.start();
    expect(window.addEventListener).toHaveBeenCalled();
  });

  it("should find window proxy object", function() {
		unauthorized = new Porthole.WindowProxy('', '');
		spyOn(unauthorized, 'getTargetWindowName').andThrow("unauthorized access");
		wrongWindowProxy = new Porthole.WindowProxy('', 'SomeOtherWindow');
		targetWindowProxy = new Porthole.WindowProxy('', 'SourceWindowName');
		o = Porthole.WindowProxyDispatcher.findWindowProxyObjectInWindow([ unauthorized, wrongWindowProxy, targetWindowProxy ], 'SourceWindowName');
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