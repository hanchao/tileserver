# TileServer

A tilelive-based tile server.

## Features

* support raster and vector tile

* serve [MBTiles](https://www.mapbox.com/developers/mbtiles/),file,[TileJSON](https://github.com/mapbox/tilejson-spec),[mapnik](http://mapnik.org/) and mapnik vector tiles

* memory cache

## Setup

[![NPM](https://nodei.co/npm/tileserver.png?downloads=true&downloadRank=true)](https://nodei.co/npm/tileserver/)

[![Build Status](https://travis-ci.org/hanchao/TileServer.svg?branch=master)](https://travis-ci.org/hanchao/TileServer)
* Clone

```git clone https://github.com/hanchao/TileServer.git```

To install dependencies and build the source files:

```npm install```

* Usages

	```./tileserver.js ./config.json 3000```

	
* Preview

  open ```http://localhost:3000/```

* Tools

    ```./tilecopy.js mbtiles://./data/mbtiles/maptest_30c930.mbtiles file://./out/```

## License

TileServer is available under the [WTFPL](http://sam.zoy.org/wtfpl/)
