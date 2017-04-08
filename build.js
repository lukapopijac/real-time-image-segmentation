'use strict';

// This file builds the project and starts watcher. 
// This is good for development, but it is not production ready.

const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const watchify = require('watchify');

const src = './src';
const dest = './build';

// create destination folder if it doesn't exist
if(!fs.existsSync(dest)) fs.mkdirSync(dest);

// copy index.html and style.css
fs.createReadStream(path.join(src, 'index.html'))
	.pipe(fs.createWriteStream(path.join(dest, 'index.html')));
fs.createReadStream(path.join(src, 'style.css'))
	.pipe(fs.createWriteStream(path.join(dest, 'style.css')));

// prepare browserify instances
var browserifyOpts = {
	debug: true,
	cache: {},
	packageCache: {},
	plugin: [watchify]
};

var createOnDone = function(entry) {
	return function(buildTime) {
		var dots = ' ...........................'.slice(0, -entry.length);
		var currentTime = new Date().toLocaleTimeString();
		console.log(entry + dots + ' ' + buildTime + ' ms, ' + currentTime);
	}
};

var onError = function(err) {
	console.log('\x1b[31m', 'Error: ' + err.message, '\x1b[0m');
}

// create browserify instances
var bMain = browserify(path.join(src, 'main.js'), browserifyOpts)
	.on('update', bundleMain)
	.on('time', createOnDone('main'));
var bWorker = browserify(path.join(src, 'worker.js'), browserifyOpts)
	.on('update', bundleWorker)
	.on('time', createOnDone('worker'));

function bundleMain() {
	bMain
		.bundle()
		.on('error', onError)
		.pipe(fs.createWriteStream(path.join(dest, 'bundle.js')));
}

function bundleWorker() {
	bWorker
		.bundle()
		.on('error', onError)
		.pipe(fs.createWriteStream(path.join(dest, 'w.js')));
}


bundleMain();
bundleWorker();
