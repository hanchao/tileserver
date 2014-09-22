#!/usr/bin/env node

require('sqlite3').verbose();
var express = require('express');
var tilelive = require('tilelive');

require('mbtiles').registerProtocols(tilelive);
require('tilelive-file').registerProtocols(tilelive);
require('tilelive-mapnik').registerProtocols(tilelive);
require('tilelive-overlay').registerProtocols(tilelive);
require('tilejson').registerProtocols(tilelive);
require('tilelive-bridge').registerProtocols(tilelive);
require('tilelive-vector').registerProtocols(tilelive);

var app = express();

var filepath = process.argv[2];

if (!filepath) {
   console.warn('usage: ./tileserver.js <tilelive URI> <port>');
   console.warn('example: ./tileserver.js mbtiles://./data/mbtiles/maptest_30c930.mbtiles 3000');
   process.exit(1);
}

var port = process.argv[3] || 3000;

tilelive.load(filepath, function(err, source) {
	if (err) {
		console.error(err.message);
		throw err;
	}
	
	console.log("load %s succeed", filepath);
	var server = app.listen(port, function() {
		console.log('Listening on port %d', server.address().port);
	});
	
	app.get('/', function(req, res){
	  res.send('<a href="/index.json">/index.json</a> <br /> <a href="/0/0/0">/{z}/{x}/{y}</a>');
	});

	app.get('/index.json', function(req, res){
		source.getInfo(function(err, info) {
			res.send(info);
		});
	});

	app.get('/:z(\\d+)/:x(\\d+)/:y(\\d+).:format([\\w\\.]+)?', function(req, res){
	    var z = req.params.z | 0,
	        x = req.params.x | 0,
	        y = req.params.y | 0,
			format = req.params.format;
		
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
});



