// segmentation with only one channel

define(function(require, exports, module) {


var imageGraph = require('imagegraph');
var structSize = 4;

function union(v, i1, i2) {
	var idx1 = i1*structSize;
	var idx2 = i2*structSize;
	if(v[idx1]<v[idx2]) {  // rank compare
		var t = idx1;
		idx1 = idx2;
		idx2 = t;
		t = i1;
		i1 = i2;
		i2 = t;
	}
	if(v[idx1]===v[idx2]) v[idx1]++;
	v[idx2+1] = i1;          // parent
	
	v[idx1+2] += v[idx2+2];  // size
	v[idx1+3] += v[idx2+3];  // sumX
	//v[idx1+4] += v[idx2+4];  // sumY
	//v[idx1+5] += v[idx2+5];  // sumZ
}

/*
function find(v, i) {
	var j = i*structSize + 1;
	if(v[j] !== i) {
		v[j] = find(v, v[j]);
	}
	return v[j];
}
*/

function find(v, i) {
	var old_i = i;
	for(;;) {
		var j = i*structSize + 1;
		if(v[j]===i) break;
		i = v[j];
	}
	var ret = i;
	
	i = old_i;
	for(;;) {
		var j = i*structSize + 1;
		if(v[j]===i) break;
		i = v[j];
		v[j] = ret;
	}
	
	
	return ret;
}

function myDistance(v, i1, i2) {
	// just comparing mean values between two sets
	var idx1 = i1*structSize;
	var idx2 = i2*structSize;
	
	var n1Inv = 1/v[idx1+2];
	var mu1X = n1Inv * v[idx1+3];
	//var mu1Y = n1Inv * v[idx1+4];
	//var mu1Z = n1Inv * v[idx1+5];

	var n2Inv = 1/v[idx2+2];
	var mu2X = n2Inv * v[idx2+3];
	//var mu2Y = n2Inv * v[idx2+4];
	//var mu2Z = n2Inv * v[idx2+5];
	
	var dMuX = mu1X - mu2X;
	//var dMuY = mu1Y - mu2Y;
	//var dMuZ = mu1Z - mu2Z;
	
	return dMuX*dMuX;
	
	/*
	var mX = dMuX*dMuX;
	var mY = dMuY*dMuY;
	var mZ = dMuZ*dMuZ;
	
	return mX + mY + mZ;
	*/
}


function segmentation(imageData, edges, threshold) {
	var data = imageData.data;
	var width = imageData.width;
	var height = imageData.height;
	
	var len = width*height;
	var v = new Int32Array(structSize*len);
	
	for(var i=0; i<len; ++i) {
		var j = 4*i;
		var r = data[j];
		var g = data[j+1];
		var b = data[j+2];
		var idx = structSize*i;
		//  0 rank,  1 parent,  2 size,  3 sumX,  4 sumY,  5 sumZ
		v[idx+1] = i; // parent
		v[idx+2] = 1; // size
		v[idx+3] = r+g+b; // sumX
		//v[idx+4] = g; // sumY
		//v[idx+5] = b; // sumZ
	}
	
	for(var j=0; j<edges.length; ++j) {
		var e = edges[j];
		var i1 = e&0x7ffff;
		var i2 = e&0x80000 ? i1+width : i1+1;
		
		// find indices of set representatives
		i1 = find(v, i1);
		i2 = find(v, i2);
		if(i1 === i2) continue;
		//var weight = (e>>>20)|0;
		
		if(myDistance(v, i1, i2)<threshold) union(v, i1, i2);

		
	}

	imageData.data.set(avgColorImage(v, width, height));
	return imageData;
}

function avgColorImage(v, width, height) {
	var dataOut = new Uint8ClampedArray(4*width*height);
	
	for(var i=0; i<width*height; ++i) {
		var iRoot = find(v, i);
		var idx = iRoot*structSize;
				
		var nInv = .33*1/v[idx+2];
		dataOut[4*i  ] = nInv * v[idx+3];
		dataOut[4*i+1] = nInv * v[idx+3];
		dataOut[4*i+2] = nInv * v[idx+3];
		dataOut[4*i+3] = 255;
	}
	return dataOut;
}


module.exports = function(imageData, threshold) {
	var edges = imageGraph(imageData);
	var s = segmentation(imageData, edges, threshold);
	return s;
}


});
