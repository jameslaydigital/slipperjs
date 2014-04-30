slipperjs
=========

Extremely intuitive data watching for javascript.  Try it on, you might like it!


about
=====

```javascript
var sl = new Slipper({a:"hi", b:"there"});
sl.addEvent("get", "a", function(value) {
	console.log("value of a is " + value);
});
```
