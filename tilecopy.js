#!/usr/bin/env node

var fs = require('fs');
var url = require('url');
var util = require('util');
var path = require('path');
var progress = require('progress-stream');

require('sqlite3').verbose();
var tilelive = require('tilelive');

require('mbtiles').registerProtocols(tilelive);
require('tilelive-file').registerProtocols(tilelive);
require('tilelive-mapnik').registerProtocols(tilelive);
require('tilelive-overlay').registerProtocols(tilelive);
require('tilejson').registerProtocols(tilelive);
require('tilelive-bridge').registerProtocols(tilelive);
require('tilelive-vector').registerProtocols(tilelive);

var argv = require('minimist')(process.argv.slice(2), {
    alias: {
        s: 'scheme',
        l: 'list',
        c: 'concurrency',
        b: 'bounds',
        bbox: 'bounds'
    }
});

if (!argv._[0]) {
    console.log('Usage:');
    console.log('  tilelive-copy <src> [dst]');
    console.log('');
    console.log('Example:');
    console.log('  tilelive-copy mbtiles://./data/mbtiles/maptest_30c930.mbtiles file://./out/');
    console.log('');
    console.log('Options:');
    console.log('  --scheme=[scanline,pyramid,list]  Default: scanline.');
    console.log('  --list=[filepath]                 Filepath if scheme is list.');
    console.log('  --concurrency=[number]            Copy concurrency.');
    console.log('  --withoutprogress                 Shows progress by default');
    console.log('  --bounds=[w,s,e,n]');
    console.log('  --minzoom=[number]');
    console.log('  --maxzoom=[number]');
    console.log('  --parts=[number]');
    console.log('  --part=[number]');
    process.exit(1);
}

argv.scheme = argv.scheme || 'scanline';
argv.list = argv.list || undefined;
argv.concurrency = argv.concurrency !== undefined ? parseInt(argv.concurrency,10) : undefined;
argv.bounds = argv.bounds !== undefined ? argv.bounds.split(',').map(function(v) { return parseFloat(v); }) : undefined;
argv.minzoom = argv.minzoom !== undefined ? parseInt(argv.minzoom,10) : undefined;
argv.maxzoom = argv.maxzoom !== undefined ? parseInt(argv.maxzoom,10) : undefined;
argv.withoutprogress = argv.withoutprogress ? true : false;
argv.parts = argv.parts || undefined;
argv.part = argv.part || undefined;

if (argv.scheme !== 'pyramid' && argv.scheme !== 'scanline' && argv.scheme !== 'list') {
    console.warn('scheme must be one of pyramid, scanline, list');
    process.exit(1);
}

if (argv.scheme === 'list' && !argv.list) {
    console.warn('--list=file required for list scheme');
    process.exit(1);
}

var srcuri = argv._[0];
var dsturi = argv._[1] ? argv._[1] : false;
// register modules
tilelive.auto(srcuri);
if (dsturi) tilelive.auto(dsturi);

copy();

function copy() {
    var options = {
        type:argv.scheme,
        minzoom:argv.minzoom,
        maxzoom:argv.maxzoom,
        bounds:argv.bounds
    };

    if (!argv.withoutprogress && dsturi) options.progress = report;
    if (argv.concurrency) options.concurrency = argv.concurrency;
    if (argv.part && argv.parts) options.job = {
        total:argv.parts,
        num:argv.part
    };
    // Create readstream for lists
    if (options.type === 'list') {
        options.listStream = fs.createReadStream(argv.list);
    }
    if (!dsturi) options.outStream = process.stdout;

    tilelive.copy(srcuri, dsturi, options, function(err) {
        if (err) throw err;
        console.log('');
    });
}

function report(stats, p) {
    util.print(util.format('\r\033[K[%s] %s%% %s/%s @ %s/s | ✓ %s □ %s | %s left',
        pad(formatDuration(process.uptime()), 4, true),
        pad((p.percentage).toFixed(4), 8, true),
        pad(formatNumber(p.transferred),6,true),
        pad(formatNumber(p.length),6,true),
        pad(formatNumber(p.speed),4,true),
        formatNumber(stats.done - stats.skipped),
        formatNumber(stats.skipped),
        formatDuration(p.eta)
    ));
}

function formatDuration(duration) {
    var seconds = duration % 60;
    duration -= seconds;
    var minutes = (duration % 3600) / 60;
    duration -= minutes * 60;
    var hours = (duration % 86400) / 3600;
    duration -= hours * 3600;
    var days = duration / 86400;

    return (days > 0 ? days + 'd ' : '') +
        (hours > 0 || days > 0 ? hours + 'h ' : '') +
        (minutes > 0 || hours > 0 || days > 0 ? minutes + 'm ' : '') +
        seconds + 's';
}

function pad(str, len, r) {
    while (str.length < len) str = r ? ' ' + str : str + ' ';
    return str;
}

function formatNumber(num) {
    num = num || 0;
    if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'm';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'k';
    } else {
        return num.toFixed(0);
    }
    return num.join('.');
}

function timeRemaining(progress) {
    return Math.floor(
        (process.uptime()) * (1 / progress) -
        (process.uptime())
    );
}
