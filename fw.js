function whatis(obj) {
	var dict = {};
	for ( var key in obj ) {
		dict[key] = typeof(obj[key]);
	}
	return dict;
}

var Setter = (function() {
	function synchronizeProps(obj, fw) {
		if ( typeof(obj) != "object" ) return null;
		//return new FW(obj);
		for ( var key in obj ) {
			//console.log("KEY: ", key);
			if ( key in fw ) {
				//console.log("\tKEY IS IN FW.");
				if ( typeof(obj[key]) != "object" ) {
					//console.log("\t\tKEY TYPE IS NOT OBJECT.");
					fw[key] = obj[key]
				} else {
					fw[key] = obj[key];
					//console.log("key in fw, typeof obj[key] == object");
					//console.log("fw[key] = ", fw[key]);
					//console.log("obj[key] = ", obj[key]);
					fw[key] = synchronizeProps(obj[key], fw[key]);
				}
			} else {
				//console.log("\tKEY IS NOT IN FW.");
				//what do you want to do here?
				fw.bypass[key] = obj[key];
				makeSettersForKey.call(fw, key, fw.bypass);
			}
		}

		for ( var key in fw ) {
			if ( !(key in obj) ) {
				delete(fw[key]);
			}
		}

		return fw;

	}

	function makeSettersForKey(key, input) {
		if ( typeof(input[key]) != "object" ) {
			(function(key) {
				Object.defineProperty(this, key, {
					get : function() {
						this.trigger(key, "get", input[key]);
						return input[key];
					},
					set : function(value) {
						input[key] = value;
						this.trigger(key, "set", input[key]);
						return input[key];
					},
					enumerable : true,
					configurable : true,
				});
			}).call(this, key);
		} else if (typeof input[key] == "object") {
			//console.log("TYPEOF KEY IS OBJECT");
			(function(key) {
				var fw = new FW(input[key]);
				Object.defineProperty(this, key, {
					get : function() {
						this.trigger(key, "get", input[key]);
						return fw;
						//you can return a new FW() because 
						//the FW will call the same getters and setters.
						//therefore it is unnecessary to store the FWs.
					},
					set : function(value) {
						this.trigger(key, "set", input[key]);
						//console.log("value is ", value);
						//input[key] = value;
						fw = synchronizeProps(value, fw);
						return fw;
					},
					enumerable : true,
					configurable : true,
				});
			}).call(this, key);
		}
	}
	function updateChanges() {
		for ( var key in this ) {
			if ( !(key in this.bypass) ) {
				this.bypass[key] = this[key];
				//when adding a property event before defining 
				//said property, you must automatically define the object,
				//create getters and setters, and sync with the bypass.
				makeSettersForKey.call(this, key, this.bypass);
			}
		}
	}
	function snapShot(thing) {
		var newobj = {bypass:{}};
		for ( var key in thing ) {
			newobj.bypass[key] = 0;
		}
		return newobj;
	}
	function FW(input) {
		if ( typeof input == "undefined" ) {
			input = {};
		}
		Object.defineProperty(this, "bypass",	{value:input, configurable: true, enumerable:false});
		for ( var key in input ) {
			makeSettersForKey.call(this, key, input);
		}
	}
	window.gets = new FunctionMap();
	window.sets = new FunctionMap();
	window.xets = [];
	FW.prototype = [];
	FW.prototype.clearEvents = function(index) {
		updateChanges.call(this);
		gets.reset(this.bypass, index);
		sets.reset(this.bypass, index);
		return true;
	};

	FW.prototype.addEvent = function(type, index, action) {
		updateChanges.call(this);
		if ( !(index in this) ) {
			//if the interface's key does not exist...
			makeSettersForKey.call(this, index, this.bypass);
		}
		if ( type == "get" ) {
			gets.put(this.bypass, index, action);
		} else if ( type == "set" ) {
			sets.put(this.bypass, index, action);
		} else {
			throw new TypeError("Only get and set are allowed.");
		}
	};

	FW.prototype.trigger = function(key, op, value) {
		//console.log("trigger says: ");
		//console.log("\tkey: ", key);
		//console.log("\top: ", op);
		//console.log("\tvalue: ", value);
		if ( op == "get" ) {
			//TODO: actionlist is a list, as in array.
			//call each element in the array in sequence.
			// unify this function with the setter one, save some space.
			var actionlist = gets.get(this.bypass, key);
			if ( actionlist != null ) {
				(function() {
					for ( var i = 0; i < actionlist.length; i++ ) {
						actionlist[i](value);
					}
				}
				)();
			}
		}
		if ( op == "set" ) {
			var actionlist = sets.get(this.bypass, key);
			if ( actionlist != null ) {
				(function() {
					for ( var i = 0; i < actionlist.length; i++ ) {
						actionlist[i](value);
					}
				}
				)();
			}
		}
	};

	Object.defineProperty(FW.prototype, "trigger", {enumerable:false});
	Object.defineProperty(FW.prototype, "addEvent", {enumerable:false});
	Object.defineProperty(FW.prototype, "clearEvents", {enumerable:false});
	Object.defineProperty(FW, "bypass", {enumerable:false});
	return FW;
})();

//UNIT TESTS
function runUnitTests() {
	window.receiver	= document.getElementById("receiver");
	window.emitter		= document.getElementById("emitter");

	window.data = {
		a : 1,
		c : {
			first : "this is first",
			second : "this is second",
		},
	};

	window.stuff = new Setter(data);

	stuff.addEvent("get", 'a', function(value) {
					console.log("a was got!");
					receiver.innerHTML = value;
				});

	stuff.addEvent("set", 'a', function(value) {
					console.log("a was set!");
					receiver.innerHTML = value;
				});

	stuff.addEvent("set", 'c', function(value) {
					console.log("c was set!");
					//console.log("set is ", value);
					receiver.innerHTML = value;
				});

	emitter.onkeydown = function() {
		var input = this;
		setTimeout(function() {
			stuff.a = input.value;
		}, 0);
	}

	//try adding an event before defining the property
	console.log("runUnitTest: Should see: the_set_prop is me.");
	stuff.addEvent("set", 'the_set_prop', function(value) {
		console.log("the_set_prop is " + value);
	})
	stuff.the_set_prop = "me";

	//try defining a property before adding an event
	//and see if the event fires.
	console.log("runUnitTest: Should see: predefined is howdy.");
	stuff.predefined = "howdy";
	stuff.addEvent("get", 'predefined', function(value) {
		console.log("predefined is " + value);
	})
	stuff.predefined;

	//try adding an object as a property
	console.log("runUnitTest: Should see: stuff.c.a was got!.");
	stuff.c.addEvent("get", 'a', function(value) {
		console.log("-------------\t\t\tstuff.c.a was got!");
	});
	stuff.c.a;

	console.log("\n");
	//adding an event on a sub-level data object before defining it.
	stuff.c.addEvent("set", "a", function(value) {
		console.log("stuff.c.a was set to " + value);
	});
	console.log("runUnitTest: Should see: stuff.c.a was set to a new record!");
	stuff.c.a = " a new record!";

	console.log("\n");
	console.log("runUnitTest: Should see: first was got!");
	stuff.c.addEvent("get", 'first', function(value) {
		console.log("\t\t\t\t\t\tFIRST WAS GOT!");
	});
	stuff.c.first;

	console.log("\n");
	//defining a property in the bypass then adding an event for it
	stuff.bypass.e = "e";
	stuff.addEvent("get", "e", function() {
		console.log("the e is me.");
	});
	console.log("should see 'the e is me'.");
	stuff.e;

	console.log("\n");
	//defining an object reference in the interface, then adding an event.
	console.log("Should see: \"f is got.\", then should see an FW object.");
	stuff.f = {"a":"hi"};
	stuff.addEvent("get", "f", function() {
		console.log("f is got.");
	});
	console.log(stuff.f);

	//defining a property in the interface, then accessing the property in the bypass
	//without first adding an event.
	//can't make the bypass a getter/setter because the bypass is by definition a way 
	//to bypass that function.
	console.log("\n");
	stuff.g = "I'm g.";
	//stuff.addEvent("set", "g", function() { console.log("gg, man."); });
	//stuff.bypass.g = "I'm no longer g.";
	console.log(stuff.g);

	//don't define NEW properties using the bypass.  There is NO PRACTICAL REASON to do this.
	//NEW properties are always defined in the INTERFACE.
	//However:
	//You are free to define a property in the interface, then make subsequent sets 
	//and gets using the bypass.

	//defining a property on a sub-level data object before adding an event for it.
	stuff.c.addEvent("set", "b", function(value) {
		console.log("stuff.c.b was set to " + value);
	});
	console.log("runUnitTest: Should see: stuff.c.b was set to b new record!");
	stuff.c.b = " b new record!";

	console.log(whatis(stuff.c));
	stuff.c = {
		"a" : {
			a : "this is my a",
			b : "this is my b",
		},
		"hi": {
			a : "this is a",
			b: "this is b"
		}
	};
	console.log(whatis(stuff.c));

}

runUnitTests();


/*

	TRUE MVC:
	In true MVC philosophy, the (M)odel can speak to the (V)iew, the (V)iew can speak to the (C)ontroller, and the 
	(C)ontroller can speak to the (M)odel.  No backward communication is allowed.  While enforcing this paradigm is 
	a hopeless cause, designing the system to work best with one-way communication is more intuitive and true with this 
	framework than most others.  I will explain:

		Angular js implements a different design paradigm than MVC, and those who try to design an MVC application 
		through Angular will find it difficult at some point.  Angular simulates synchronicity between the view and the 
		model by hijacking the event loop. This is problematic because the view will not synchronize with the data when you 
		modify or access the model programatically (perhaps through a callback after an asynchronous event).  To the credit 
		of Angular, it provides methods to overcome this tribulation, but it's not intuitive.

		Backbone js properly provides MVC, but the learning curve is steep.  Backbone provides specialized data types which 
		interface with the data through explicit getter and setter methods.  It's these getter and setter methods which trigger 
		the synchronization logic for the views.

		I personally learned Backbone first, and I liked it.  When I learned Angular, I liked it much more and found that my 
		productivity went through the roof.  I feel like the primary reason for the spike in productivity can be attributed to 
		the more friendly learning curve of Angular and the ease through which you can bind data to the view.

		With a large number of built-in directives and an included templating language, Angular was the obvious choice.
		However, had backbone come with "batteries included", Angular still has one MAJOR advantage: you don't have to read 
		a tutorial to interact with the model.  They're all just good ol' fashioned javascript datatypes.

		The closest I can bring these worlds together is to provide an interface to the data with transparent getters and setters.
		The interface should act almost exactly like Javascript's built-in datatypes.  However, the view logic is not dependent on 
		the DOM event loop, but rather by transparent interaction with the interface.

		This is difficult to communicate, and truly the advantages of this method are ineffable without a long-winded speech.
		So, let me demonstrate achieving the same end goal through all three frameworks:

			Backbone:
				<div id="receiver"></div>
				<input type="text" id="emitter" />
				<script type="text/javascript">
				</script>

			Angular:
				<div>{{model.a}}</div>
				<input type="text" ng-bind="model.a" />
				<script type="text/javascript">
				</script>

			Framework:
				<div id="receiver"></div>
				<input type="text" id="emitter" />
				<script type="text/javascript">
					var IF = FW({
						a : "first element",
						b : "second",
					});
					emitter.onkeypress = function() {
						IF.a = this.value;
					}
					IF.addEvent("get", "a", function(value) {
						document.getElementById("receiver").innerHTML = value;
					});
				</script>


	BINDING:
	In the same way Angular js provides attributes for binding, some system must be available to simplify
	communication with the views.

	TEMPLATES:
	Angular accomplishes templating through the use of templates and directives.

	DATA REASSIGNMENT VIA THE INTERFACE:
	The most practial example I can think of for this framework is to use it to automatically 
	update the view when data comes back from the server.  If a simple reassignment was able 
	to trigger all the events and leave the interface intact, this would be very powerful.
	In simple english, reassignment of the model with new data would update the views.


	Theoretically, this feature is thwarted because overwriting the data 
	would also overwrite the listeners.  However, with the current architecture, even the 
	"nodes" (this is what I'll call properties who are objects) can have xetters on them.
	With this consideration, setting the node could trigger a transparent setter function to
	carefully reset the internal data without overwriting the triggers.

	For instance: 
		> stuff.data = JSON.parse(xml.responseText);
		> //^^ updates views.
	
	To be useful, this feature would have to ensure synchronicity.  There are several methods 
	by which we can accomplish this, all with their unique pros and cons.

	1. COMPLETE TRANSPARENCY:

		DESCRIPTION
		In the transparent method, synchronicity is ensured not only by importing new properties from 
		the updated data, but also by removing properties which are not in the updated data.

		THOUGHTS
		This is the favored method because it will seem most intuitive to the programmers.
		Programmers will always favor an intuitive system over one with a steep learning curve,
		especially if their choices offer similar benefits.

		The other advantage of this design is it would allow the standard Array.prototype methods, such 
		as "filter", to provide a reassignment.
	
	2. SEMI TRANSPARENCY:

		DESCRIPTION
		In the semi transparent method, synchronicity is performed only via union of the updated data 
		with the old data. No properties are removed without the programmer removing them explicitly.

		This method is favorable when responses from the server are unpredictable, and the data has 
		heavy and complex listeners which would be painstaking and costly to replace every update.
		This method becomes inconvenient when the programmer has to remove a large number of properties.
	
	3. HYBRID:

		DESCRIPTION
		In the Hybrid method, synchronicity is ensured using the complete transparency method, only 
		the programmer can explicitly "lock" chosen properties to ensure they are not removed.

		This would be undoubtedly the most difficult to implement, but offers the advantages of 
		both the aforementioned, without the drawbacks.

	Ultimately, the complete transparency method will be the most intuitive, so I will implement that 
	one first, and even after implementing the locking mechanism all properties will be "unlocked" by default, 
	so those who are not expecting such a mechanism won't be bothered with its details.

	Perhaps instead of a locking mechanism, a permissions system could be put in place.  Permissions 
	could allow specific scopes to have access to specific data properties.  I will have to consider both 
	the application and practicality before implementing such a painstaking and potentially bloated feature.

*/
