slipperjs
=========

Extremely intuitive data watching for javascript.  Try it on, you might like it!


about
=====

```javascript

function action (val) {
	console.log("value of a is " + val);
}

var sl = new Slipper();
sl.addEvent("get", "number", action);
sl.number = 5;

```
