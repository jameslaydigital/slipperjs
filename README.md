slipperjs
=========

Extremely intuitive data watching for javascript.

download
========

You only need the Slipper.js file.
You can use it in Node.js, Chrome, and Firefox.
Untested in IE and older browsers.

```bash
wget "http://raw.githubusercontent.com/jameslaydigital/slipperjs/master/Slipper.js"
#or
curl "http://raw.githubusercontent.com/jameslaydigital/slipperjs/master/Slipper.js" > Slipper.js
```
In node.js:
```javascript
var Slipper = require("/path/to/Slipper.js");
```
In browsers:
```html
<script type="text/javascript" src="/URI/to/Slipper.js"></script>
```

example
=======

```javascript

function action (val) {
	console.log("number is " + val);
}

var sl = new Slipper();
sl.addGet("number", action);
sl.number = 5;
//--> "number is 5"

```


why?
====

Because there's no better way to make sure the views are always displaying the data.

...and because you can do this:

```javascript

var users = [
	{fname:"james", lname:"lay"},
	{fname:"john", lname:"do"},
	{fname:"jane", lname:"do"},
];

var sl = new Slipper();
sl.currentUser.addSet("fname", function(val) {
	alert("I'm " + val);
});

sl.currentUser = users[0];
// --> "I'm james!"
sl.currentUser = users[1];
// --> "I'm john!"
sl.currentUser = users[2];
// --> "I'm jane!"

```

how?
====

Slipper works by wrapping a data object in a transparent interface of getters and setters designed to trigger "events" when properties are read or written.
The Slipper object does a surprisingly good job of keeping up, allowing you to add and remove properties in almost any situation. In most situations, you 
can treat the Slipper object like any other javascript object, defining new properties, tossing references around, etc...

It's even recursive!  Properties which are objects are called "nodes", and can have their own events as well.

You don't need a tutorial to use it, you can learn mostly everything by messing around with the object.  Just remember that you can't have getters or setters on the parent node:

```javascript

var sl = new Slipper();
sl = "hi";
//you just lost your Slipper!

```


