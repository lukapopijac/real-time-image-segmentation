importScripts('require.js');
require(['segmentation'], function() {


var segmentation = require('segmentation');

self.addEventListener('message', function(evt) {
	var imageData = evt.data.imageData;
	
	var t0 = new Date();
	imageData = segmentation(imageData, evt.data.threshold);
	self.postMessage({imageData: imageData, time: new Date() - t0});
}, false);


});
