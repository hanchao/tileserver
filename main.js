console.log("test");

require('sqlite3').verbose();

var MBTiles = require('mbtiles');

var bmtilesFile = "/Users/chaohan/Documents/maptest_30c930.mbtiles";

var btTiles = new MBTiles(bmtilesFile, function(err, mbtiles) {
                if (err) throw err;
				console.log(mbtiles);
				
				btTiles.getTile(0, 0, 0, function(err, tile, headers) {
				 			                if (err) throw err;
											console.log(tile);
											console.log(headers);
				 			            });
            });

console.log("test end");