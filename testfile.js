
(function() {

	function whatis(obj) {
		var dict = {};
		for ( var key in obj ) {
			dict[key] = typeof(obj[key]);
		}
		return dict;
	}

	//UNIT TESTS
	function runUnitTests() {
		window.receiver	= document.getElementById("receiver");
		//window.emitter		= document.getElementById("emitter");

		window.data = {
			a : 1,
			c : {
				first : "this is first",
				second : "this is second",
			},
		};

		window.stuff = new Slipper(data);

		stuff.addEvent("get", 'a', function(value) {
						console.log("a was got!");
						//receiver.innerHTML = value;
					});

		stuff.addEvent("set", 'a', function(value) {
						console.log("a was set!");
						console.log("value = " + value);
						//receiver.innerHTML = value;
					});

		stuff.addEvent("set", 'c', function(value) {
						console.log("c was set!");
						//console.log("set is ", value);
						//receiver.innerHTML = value;
					});

		//emitter.onkeydown = function() {
		//	var input = this;
		//	setTimeout(function() {
		//		stuff.a = input.value;
		//	}, 0);
		//}

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
		console.log("Should see: \"f is got.\", then should see an SL object.");
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

	}

	users = function() {
		window.users = [
			{	fname	: "James",
				lname	: "Lay",
				age		: 25, },
			{	fname	: "Melissa",
				lname	: "Guardian",
				age		: 23, },
			{	fname	: "Flynn",
				lname	: "Holland",
				age		: "25", },
		];


		window.currentUser = new Slipper({
			person : 
				{
					fname : "",
					lname : "",
					age : 0
				},
			view : undefined,
		});

		currentUser.person.addEvent("set", "fname", function(value) { 
			document.getElementById("fname" ).innerHTML = value;
		});

		currentUser.person.addEvent("set", "lname", function(value) {
			document.getElementById("lname").innerHTML = value;
		});

		currentUser.person.addEvent("set", "age", function(value) {
			document.getElementById("age").innerHTML = value;
		});

		currentUser.addEvent("set", "view", function(value) {
			var us = document.getElementById("userSelection");
			for ( var i = 0; i < us.children.length; i++ ) {
				us.children[i].className = "user";
			}
			value.className = "user selected";
		});

		currentUser.person = users[0];
		var i = 0;

		(function() {
			for ( var i = 0; i < users.length; i++ ) {
				var div = document.createElement("div");
				div.className = "user";
				div.innerHTML = users[i].fname + " " + users[i].lname;

				div.onclick = (function(user) {
					currentUser.person = user;
					currentUser.view = this;
				}).bind(div, users[i]);

				var us = document.getElementById("userSelection");
				us.appendChild(div);
			}
		})();

	}

	users();
	runUnitTests();

})();
