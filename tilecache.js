"use strict";

var url = require("url"),
    util = require("util");

var lockingCache = require("locking-cache");

var enableCaching = function(uri, source, locker) {
  if (source._cached) {
    // already cached

    return source;
  }

  if (typeof(uri) === "string") {
    uri = url.parse(uri, true);
  }

  var makeKey = function(name, context) {
    // collect properties attached to the callback
    var properties = {};

    Object.keys(context.callback).forEach(function(k) {
      properties[k] = context.callback[k];
    });

    var key = util.format("%s:%j@%j", name, uri, properties);

    // glue on any additional arguments using their JSON representation
    key += Array.prototype.slice.call(arguments, 2).map(JSON.stringify).join(",");

    return key;
  };

  if (source.getTile) {
    var _getTile = source.getTile.bind(source);

    source.getTile = locker(function(z, x, y, lock) {
      return lock(makeKey("getTile", this, z, x, y), function(unlock) {
        return _getTile(z, x, y, unlock);
      });
    }).bind(source);
  }

  if (source.getGrid) {
    var _getGrid = source.getGrid.bind(source);

    source.getGrid = locker(function(z, x, y, lock) {
      return lock(makeKey("getGrid", this, z, x, y), function(unlock) {
        return _getGrid(z, x, y, unlock);
      });
    }).bind(source);
  }

  if (source.getInfo) {
    var _getInfo = source.getInfo.bind(source);

    source.getInfo = locker(function(lock) {
      return lock(makeKey("getInfo", this), function(unlock) {
        return _getInfo(unlock);
      });
    }).bind(source);
  }

  // TODO watch for collisions
  // http://raganwald.com/2014/04/10/mixins-forwarding-delegation.html may have
  // some ideas on how to prevent this
  source._cached = true;

  return source;
};

module.exports = function(tilelive, options) {
  options = options || {};
  options.size = "size" in options && options.size !== undefined ? options.size : 10;
  options.sources = (options.sources | 0) || 6;

  // defined outside enableCaching so that a single, shared cache will be used
  // (this requires that keys be namespaced appropriately)
  var locker = lockingCache({
    max: 1024 * 1024 * options.size, // convert to MB
    length: function(val) {
      return val[0] ? val[0].length : 1;
    },
    maxAge: 6 * 3600e3 // 6 hours
  });

  var cache = Object.create(tilelive);

  var lockedLoad = lockingCache({
    max: options.sources,
    dispose: function(key, values) {
      // don't close the source immediately in case there are pending
      // references to it that haven't requested tiles yet
      setTimeout(function() {
        // the source will always be the first value since it's the first
        // argument to unlock()
        values[0].close(function() {});
      }, (options.closeDelay || 30) * 1000);
    }
  });

  cache.load = lockedLoad(function(uri, lock) {
    if (typeof(uri) === "string") {
      uri = url.parse(uri, true);
    }

    uri.query = uri.query || {};
    uri.query.cache = "cache" in uri.query ? uri.query.cache : true;

    var key = JSON.stringify(uri);

    return lock(key, function(unlock) {
      return tilelive.load(uri, function(err, source) {
        if (!err &&
            options.size > 0 &&
            uri.query.cache !== false &&
            uri.query.cache !== "false") {
          source = enableCaching(uri, source, locker);
        }

        return unlock(err, source);
      });
    });
  });

  return cache;
};
