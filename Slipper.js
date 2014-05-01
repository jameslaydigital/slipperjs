var Slipper = (function() {

	//Returns true if it is a DOM node
	function isNode(o){
		return (
			typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}

	//Returns true if it is a DOM element    
	function isElement(o){
		return (
			typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	}

	var FunctionMap = (function() {
		// how does the hash map work?
		// it will contain an internal array
		function FM() {
			var indexArray = [];
			var valueArray = [];

			this.keys = function() {
				return indexArray;
			}

			this.get = function(obj, key) {
				//INDEX EXISTS?
				for ( var i = 0; i < indexArray.length; i++ ) {
					if ( indexArray[i] === obj ) {
						//INDEX DOES EXIST
						//DOES KEY EXIST?
						var dict = valueArray[i];
						if ( key in dict ) {
							//KEY EXISTS
							return dict[key];
						}
						//KEY DOES NOT EXIST
						return null;
					}
				}
				//INDEX DOES NOT EXIST
				return null;
			}

			this.reset = function(obj, key) {
				for ( var i = 0; i < indexArray.length; i++ ) {
					if ( indexArray[i] === obj ) {
						valueArray[i][key] = [];
						return true;
					}
				}
				return false;
			}

			this.put = function(obj, key, action) {
				if ( typeof(action) != "function" ) {
					throw new TypeError("actions must be functions.");
				}
				//INDEX EXISTS?
				//console.log("\tDoes obj exist as index?");
				for ( var col = 0; col < indexArray.length; col++ ) {
					if ( indexArray[col] === obj ) {
						//console.log("\t\tYES, INDEX DOES EXIST");
						//YES
						//DOES KEY EXIST IN DICT?
						var dict = valueArray[col];
						//console.log("\t\t\tDOES KEY EXIST IN DICT?");
						if ( key in dict ) {
							//console.log("\t\t\t\tYES, KEY EXISTS IN DICT.");
							//YES
							var actionlist = dict[key];
							actionlist.push(action);
							return true;
						} else {
							//console.log("\t\t\t\tNO, KEY DOES NOT EXIST IN DICT.");
							//NO
							dict[key] = [action];
							return false;
						}
					}
				}
				//console.log("\t\tNO, OBJ DOES NOT EXIST AS INDEX");
				//NO
				var i = indexArray.length;
				indexArray[i] = obj;
				valueArray[i] = {};
				valueArray[i][key] = [action];
				return true;
			}

			this.add = this.put;

		}

		return FM;
	})();

	/*
		FunctionMap works like so:

			You get two parallel arrays, one of which holds the "index", the other holds 
			array_dictionary objects.

			indexArray   valueArray
			¯¯¯¯¯¯¯¯¯¯   ¯¯¯¯¯¯¯¯¯¯
			 [index0] <-> [dict0]
			 [index1] <-> [dict1]
			 [index2] <-> [dict2]
			 [index3] <-> [dict3]
			 [index4] <-> [dict4]
				 ↓     ↓     ↓   

			If you request index0, you will receive dict0.
			For example:

				> hm.get(index0);  // --> dict0: { a : [], b : [] ... }

			If you "put" an index, it will first check if the index exists.
			If it does not find it, it will append the key to the index array and 
			add an array_dictionary object on the right side. The key supplied will go into 
			the array_dictionary.

	*/

	if ( typeof(global) == "undefined" ) {
		var topLevelObject = window;
	} else {
		var topLevelObject = global;
	}
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
		} else if (typeof(input[key]) == "object") {
			//console.log("TYPEOF KEY IS OBJECT");
			(function(key) {
				var fw = new SL(input[key]);
				Object.defineProperty(this, key, {
					get : function() {
						this.trigger(key, "get", input[key]);
						return fw;
						//you can return a new SL() because 
						//the SL will call the same getters and setters.
						//therefore it is unnecessary to store the SLs.
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
		if ( typeof(input) == "undefined" ) {
			input = {};
		}
		if ( typeof(input) != "object" ) {
			return null;
		}
		if ( isElement(input) ) {
			throw new TypeError("Cannot spawn watcher for DOM elements.");
		}
		if ( isNode(input) ) {
			throw new TypeError("Cannot spawn watcher for DOM nodes.");
		}
		if ( this === topLevelObject ) {
			//if the user forgot to use the "new" keyword.
			//can't be just "window" because node uses "global".
			return new SL(input);
		}
		Object.defineProperty(this, "bypass",	{value:input, configurable: true, enumerable:false});
		for ( var key in input ) {
			makeSettersForKey.call(this, key, input);
		}
		this.toString = function() {
			return Object.prototype.toString();
		};
		Object.defineProperty(this, "toString", {
			enumerable : false,
		});
	}

	var gets = new FunctionMap();
	var sets = new FunctionMap();
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
			gets.put(this.bypass, index, action.bind(this));
		} else if ( type == "set" ) {
			sets.put(this.bypass, index, action.bind(this));
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

if ( typeof module != "undefined" ) {
	module.exports = Slipper;
}
/*

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
