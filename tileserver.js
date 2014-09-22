#!/usr/bin/env node

require('sqlite3').verbose();
var express = require('express');
var mbtiles = require('mbtiles');

var app = express();

var filepath = process.argv[2] || "./data/maptest_30c930.mbtiles";
var port = process.argv[3] || 3000;

var source = new mbtiles(filepath, function(err, mbtiles) {
	if (err) throw err;
		console.log("open file %s succeed", filepath);
		
		var server = app.listen(port, function() {
		    console.log('Listening on port %d', server.address().port);
		});
});

app.get('/', function(req, res){
  res.send('/index.json /{z}/{x}/{y}');
});

app.get('/index.json', function(req, res){
	source.getInfo(function(err, info) {
		res.send(info);
	});
});

app.get('/:z(\\d+)/:x(\\d+)/:y(\\d+)', function(req, res){
    var z = req.params.z | 0,
        x = req.params.x | 0,
        y = req.params.y | 0;
		
	console.log("get tile, z = %d, x = %d, y = %d", z, x, y);
	
	source.getTile(z, x, y, function(err, tile, headers) {
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

