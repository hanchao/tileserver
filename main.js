
require('sqlite3').verbose();
var express = require('express');
var mbtiles = require('mbtiles');

var app = express();

var bmtilesFile = "/Users/chaohan/Documents/maptest_30c930.mbtiles";
var curmbtiles = new mbtiles(bmtilesFile, function(err, mbtiles) {
	if (err) throw err;
		console.log("open file %s succeed", bmtilesFile);
		
		var server = app.listen(3000, function() {
		    console.log('Listening on port %d', server.address().port);
		});
});

app.get('/', function(req, res){
  res.send('index');
});

app.get('/hello.txt', function(req, res){
	res.send('Hello World');
});

app.get('/:z(\\d+)/:x(\\d+)/:y(\\d+)', function(req, res){
    var z = req.params.z | 0,
        x = req.params.x | 0,
        y = req.params.y | 0;
		
	console.log("get tile, z = %d, x = %d, y = %d", z, x, y);
	
	curmbtiles.getTile(z, x, y, function(err, tile, headers) {
		if (err) {
			res.status(404)
				res.send(err.message);
		}
		else {
			res.set(headers);
			res.send(tile);										
		}

	 });
});

