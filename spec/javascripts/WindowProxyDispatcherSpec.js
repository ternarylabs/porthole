describe("WindowProxyDispatcher",
function() {
	beforeEach(function() {
	});

	describe("#start",
	function() {

		it("should start",
		function() {
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
	});

	describe("#findWindowProxyObjectInWindow",
	function() {

		it("should find window proxy object",
		function() {
			unauthorized = new Porthole.WindowProxyLegacy('', '');
			spyOn(unauthorized, 'getTargetWindowName').andThrow("unauthorized access");
			wrongWindowProxy = new Porthole.WindowProxyLegacy('', 'SomeOtherWindow');
			targetWindowProxy = new Porthole.WindowProxyLegacy('', 'SourceWindowName');
			fakeWindowObject = [unauthorized, wrongWindowProxy, targetWindowProxy];
			fakeWindowObject.Porthole = {
				'WindowProxy': Porthole.WindowProxyLegacy
			};
			o = Porthole.WindowProxyDispatcher.findWindowProxyObjectInWindow(fakeWindowObject, 'SourceWindowName');
			expect(o).toEqual(targetWindowProxy);
		});
	});

	describe("#forwardMessageEvent",
	function() {

		it("should parse a valid message",
		function() {
		});

	});
});