slipperjs
=========

Extremely intuitive data watching for javascript.  Try it on, you might like it!


about
=====

```javascript

function action (val) {
	console.log("number is " + val);
}

var sl = new Slipper();
sl.addEvent("get", "number", action);
sl.number = 5;
//--> "number is 5"

```
