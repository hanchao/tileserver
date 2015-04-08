var assert = require('assert');

var tilelive = require('tilelive');
var tilecache = require("tilelive-cache")(tilelive);

require('mbtiles').registerProtocols(tilelive);
require('tilelive-file').registerProtocols(tilelive);
require('tilelive-mapnik').registerProtocols(tilelive);
require('tilelive-overlay').registerProtocols(tilelive);
require('tilejson').registerProtocols(tilelive);
require('tilelive-bridge').registerProtocols(tilelive);
require('tilelive-vector').registerProtocols(tilelive);

describe('test cache', function() {

    it('test load exist mbtiles', function(done) {
        tilecache.load('mbtiles://./data/mbtiles/maptest_30c930.mbtiles', function(err, source) {
            assert.ok(source != undefined);
            done();
        });

    });

    it('test load no exist mbtiles', function(done) {
        tilecache.load('mbtiles:///data/m/t_30c930.mbtiles', function(err, source) {
            assert.ok(source == undefined);
            done();
        });

    });


    it('test get exist tile', function(done) {
        tilecache.load('mbtiles://./data/mbtiles/maptest_30c930.mbtiles', function(err, source) {
			source.getTile(0, 0, 0, function(err, tile, headers) {
				assert.ok(tile != undefined);
            	done();
			});
        });
    });
	
    it('test get no exist tile', function(done) {
        tilecache.load('mbtiles://./data/mbtiles/maptest_30c930.mbtiles', function(err, source) {
			source.getTile(18, 10, 10, function(err, tile, headers) {
				assert.ok(tile == undefined);
            	done();
			});
        });
    });
});