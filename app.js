var http = require("http");
var fs = require("fs");
var Slipper = require("./Slipper");

var g = new Slipper({i : 0});
g.addEvent("set", "i", function(value) {
	console.log(g.toString());
	console.log("visit#: " + value);
});

http.createServer(function(req, res) {
	g.i++;
	var loc = req.url == "/" ? "./index.html" : "." + req.url;
	if ( loc.split(".").pop() == "html" ) {
		var contentType = "text/html";
	} else if ( loc.split(".").pop() == "js" ) {
		var contentType = "text/javascript";
	} else {
		var contentType = "text/plain";
	}
	fs.readFile(loc, "utf-8", function(err, data) {
		if ( err ) {
			res.writeHead(404, {"Content-Type":"text/plain"});
			res.end("Path: \"" + loc + "\";\n " + err);
			return false;
		}
		res.writeHead(200, {"Content-Type":contentType});
		res.end(data);
		return true;
	});
}).listen(3000);
