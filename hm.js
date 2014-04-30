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
