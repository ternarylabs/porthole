if (typeof window.postMessage == 'function') {

	describe("WindowProxyHTML5",
	function() {
		var windowProxyHTML5;

		beforeEach(function() {
			windowProxyHTML5 = new Porthole.WindowProxyHTML5('http://localhost/proxy.html', null);
		});

		it("should add an event listener",
		function() {
			var listener = jasmine.createSpy();
			expect(windowProxyHTML5.addEventListener(listener)).toBe(listener);
		});

		it("should remove an event listener",
		function() {
			var listener = jasmine.createSpy();
			windowProxyHTML5.addEventListener(listener);
			windowProxyHTML5.removeEventListener(listener);
		});

		it("should call an event listener",
		function() {
			var verifyEvent = function(e) {
				expect(e.data).toEqual('data');
				expect(e.origin).toEqual('');
				expect(e.source).toEqual(windowProxyHTML5);
			};
			var listener = jasmine.createSpy('listener').andCallFake(verifyEvent);
			windowProxyHTML5.addEventListener(listener);
			var evt = document.createEvent('MessageEvent');
			var data = { 
				sourceWindowName : null,
				data : 'data'
			};
            evt.initMessageEvent('message', true, true, JSON.stringify(data), '', 1, window, null);
            window.dispatchEvent(evt);
			expect(listener).toHaveBeenCalled();
		});

		it("should ignore calles from other sources",
		function() {
			var listener = jasmine.createSpy('listener')
			windowProxyHTML5.addEventListener(listener);
			var evt = document.createEvent('MessageEvent');
            evt.initMessageEvent('message', true, true, {}, '', 1, window, null);
            window.dispatchEvent(evt);
			expect(listener).not.toHaveBeenCalled();
		});
	});
}