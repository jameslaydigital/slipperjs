var Slipper = (function() {
	function synchronizeProps(obj, fw) {
		if ( typeof(obj) != "object" ) return null;
		//return new SL(obj);
		for ( var key in obj ) {
			//console.log("KEY: ", key);
			if ( key in fw ) {
				//console.log("\tKEY IS IN SL.");
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
				//console.log("\tKEY IS NOT IN SL.");
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
				var fw = new SL(input[key]);
				Object.defineProperty(this, key, {
					get : function() {
						this.trigger(key, "get", input[key]);
						return fw;
						//you can return a new SL() because 
						//the SL will call the same getters and setters.
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
	function SL(input) {
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
	SL.prototype = [];
	SL.prototype.clearEvents = function(index) {
		updateChanges.call(this);
		gets.reset(this.bypass, index);
		sets.reset(this.bypass, index);
		return true;
	};

	SL.prototype.addEvent = function(type, index, action) {
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

	SL.prototype.trigger = function(key, op, value) {
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

	Object.defineProperty(SL.prototype, "trigger", {enumerable:false});
	Object.defineProperty(SL.prototype, "addEvent", {enumerable:false});
	Object.defineProperty(SL.prototype, "clearEvents", {enumerable:false});
	Object.defineProperty(SL, "bypass", {enumerable:false});
	return SL;
})();

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
					var IF = SL({
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
