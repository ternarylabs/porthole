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

	describe(".serialize",
	function(){
		it("should serialize a string",
		function(){
			var aString = "Some random string";
			expect(Porthole.WindowProxy.serialize(aString)).toEqual('"Some random string"');
		});

		it("should serialize a an array",
		function(){
			var anArray = [1,2,3];
			expect(Porthole.WindowProxy.serialize(anArray)).toEqual('[1,2,3]');
		});

		it("should serialize a hash",
		function(){
			var aHash = { 'key' : 'value' };
			expect(Porthole.WindowProxy.serialize(aHash)).toEqual('{"key":"value"}');
		});

		it("should serialize an object",
		function(){
			var anObject = {abc: 123, x: { y: 123, z: "string"}};
			expect(Porthole.WindowProxy.serialize(anObject)).toEqual('{"abc":123,"x":{"y":123,"z":"string"}}');
		});
	});

	describe(".unserialize",
	function(){
		it("should deserialize a string",
		function(){
			expect(Porthole.WindowProxy.unserialize('"A string"')).toEqual("A string");
		});

		it("should deserialize a an array",
		function(){
			expect(Porthole.WindowProxy.unserialize('[1,2,3]')).toEqual([1,2,3]);
		});

		it("should deserialize a hash",
		function(){
			expect(Porthole.WindowProxy.unserialize('{"key":"value"}')).toEqual({ 'key' : 'value' });
		});

		it("should deserialize an object",
		function(){
			expect(Porthole.WindowProxy.unserialize('{"abc":123,"x":{"y":123,"z":"string"}}')).toEqual({abc: 123, x: { y: 123, z: "string"}});
		});

	});


});