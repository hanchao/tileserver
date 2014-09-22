# TileServer

A tilelive-based tile server.

## Features

* support raster and vector tile

* serve [MBTiles](https://www.mapbox.com/developers/mbtiles/),file,[TileJSON](https://github.com/mapbox/tilejson-spec),[mapnik](http://mapnik.org/) and mapnik vector tiles


## Setup

[![Build Status](https://travis-ci.org/hanchao/TileServer.svg?branch=master)](https://travis-ci.org/hanchao/TileServer)
* Clone

```git clone https://github.com/hanchao/TileServer.git```

To install dependencies and build the source files:

```npm install```

* Usages

    ```./tileserver.js <tilelive URI> <port>```

* Example

	* mbtiles

	```./tileserver.js mbtiles://./data/mbtiles/maptest_30c930.mbtiles 3000```

	* tilejson

	```./tileserver.js tilejson+http://a.tiles.mapbox.com/v3/mapbox.world-bright.json 3000```

	```./tileserver.js tilejson+file://./data/tilejson/world-bright.tilejson 3000```

	* file

	```./tileserver.js file://./data/file/readonly 3000```

	* mapnik

	```./tileserver.js mapnik://./data/mapnik/world.xml 3000```

	* bridge(generating mapnik vector tiles)
	
	```./tileserver.js bridge:///Users/chaohan/Documents/Git/TileServer/data/bridge/test-a.xml 3000```
	
* Preview

  open ```http://localhost:3000/```

## License

TileServer is available under the [WTFPL](http://sam.zoy.org/wtfpl/)
