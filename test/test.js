// Run with node.js

var Porthole = require("../src/porthole.js").Porthole;

// Nested check of properties of objects, verify that all of are equal.
Object.prototype.equals = function(x, check_type) {
    var p;
    check_type = typeof check_type == "undefined" ? false : check_type;
    for (p in this) {
        if(typeof(x[p]) == 'undefined') return false;
    }

    for (p in this) {
        if (this[p]) {
            switch(typeof(this[p])) {
            case 'object':
                if (!this[p].equals(x[p], check_type)) {
                    return false;
                }
                break;
            case 'function':
                if (typeof(x[p])=='undefined' ||
                    (p != 'equals' && this[p].toString() != x[p].toString()))
                    return false;
                break;
            default:
                if (this[p] != x[p]) {
                    return false;
                }
            }
        } else {
            if (x[p]) {
                return false;
            }
        }
    }
    for (p in x) {
        if(typeof(this[p]) == 'undefined') {
            return false;
        }
    }
    return check_type ? typeof this == typeof x : true;
};


// Very simple tests for now:

var num_fail = 0;
var num_ok = 0;

var ok = function(cond, msg) {
    if (!cond) {
        ++num_fail;
        console.error("FAIL\t" + msg);
    } else {
        ++num_ok;
        console.log("OK\t" + msg);
    }
};

ok(Porthole.WindowProxy, "Porthole.WindowProxy defined");

var serialize = Porthole.WindowProxy.serialize;
var unserialize = Porthole.WindowProxy.unserialize;

ok(typeof serialize === "function", "serialize function defined");
ok(typeof unserialize === "function", "userialize function defined");
ok(serialize({abc: 123}) === "abc=123", "serialize abc123");

// Objects
var obj = {abc: 123, x: { y: 123, zq: "sdfsdf"}};
ok(serialize(obj) === "abc=123&x.y=123&x.zq=sdfsdf", "serialize obj");
var obj2 = unserialize(serialize(obj));
ok(obj.equals(obj2, true), "unserialize serialized obj equals (with type check) obj");
ok(obj.equals(obj2, false), "unserialize serialized obj equals (no type check) obj");
ok(obj2.equals(obj, true), "also check the other way with type check");

ok(typeof obj == typeof obj2, "unserialize serialized obj has same type as obj");
ok(typeof obj.length == "undefined", "obj should not have .length property");
ok(typeof obj2.length == "undefined", "obj2 should not have .length property");


// Arrays
var arr = [{abc: 123, x: { y: 123, zq: "sdfsdf"}}, 2312, "adfas", {x: ["a", "b", [1,2,3]]}];
arr[323] = "asdfasdf";
var arr2 = unserialize(serialize(obj));
console.log(arr, arr2, typeof arr, typeof arr2);
ok(arr.equals(arr2), "unserialize serialized arr equals arr");
ok(typeof arr == typeof arr2, "unserialize serialized arr has same type as arr");
ok(arr.length == arr2.length, "arrays should have same length");
ok(arr.length > 0, "arrays should have length > 0");


var summary = function() {
    var num = num_ok + num_fail;
    console.log(num_ok + " / " + num + " OK");
    if (num_fail) {
        console.error(num_fail + " / " + num + " FAILED!");
    }
    return (num_ok === num && num && num_fail === 0);
};
process.exit(summary());
