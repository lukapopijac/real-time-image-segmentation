'use strict';

function imageDataFromVideo(video, width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	
	try {ctx.drawImage(video, 0, 0, width, height);}   // workaround for bug in firefox
	catch(e) {if(e.name != 'NS_ERROR_NOT_AVAILABLE') throw e;}
	
	var imageData = ctx.getImageData(0, 0, width, height);
	return imageData;
}

var updateFrameRateInfo = function() {
	var info_frame = document.getElementById('info_frame');
	var info_fps = document.getElementById('info_fps');
	var n = 8;
	var dts = new Int32Array(n);
	var sum = 0;
	var i = 0;
	return function(dt) {
		sum += dt - dts[i];
		dts[i++] = dt;
		if(i===n) i=0;
		info_frame.innerHTML = Math.round(sum/n) + ' ms';
		info_fps.innerHTML = Math.round(1000*n/sum);
	}
}();

function getThreshold() {
	var val = document.getElementById('info_threshold').innerHTML;
	return Number(val);
}

function initControls() {
	document.getElementById('res_in').onchange = function() {
		var val = this.value;
		var w = 64*val;
		var h = 48*val;
		var canvas = document.getElementById('canvas');
		canvas.width = w;
		canvas.height = h;
	};
	document.getElementById('res_in').onchange();

	document.getElementById('threshold_in').onchange = function() {
		var val = this.value;
		document.getElementById('info_threshold').innerHTML = 100*val;
	};
	document.getElementById('threshold_in').onchange();
}

function sendImageDataToWorker(canvas, video, worker) {
	var obj = {
		imageData: imageDataFromVideo(video, canvas.width, canvas.height),
		threshold: getThreshold()
	};
	worker.postMessage(obj);
}

function main() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var video = document.getElementById('video');

	// initialize getUserMedia:
	navigator.mediaDevices.getUserMedia({video: true})
		.then(stream => {
			window.stream = stream;
			video.srcObject = stream;
			video.play();
			sendImageDataToWorker(canvas, video, worker);			
		})
		.catch(error => {
			console.error(`${error.name}: ${error.message}`);
		})
	;

	// initialize worker:
	var worker = new Worker('w.js');
	var cnt = 0;
	var avg = 0;
	worker.addEventListener('message', function(evt) {
		context.putImageData(evt.data.imageData, 0, 0);
		updateFrameRateInfo(evt.data.time);
		sendImageDataToWorker(canvas, video, worker);
	});

	// initialize controls:
	initControls();
}

main();
