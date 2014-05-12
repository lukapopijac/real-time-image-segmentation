define(function(require, exports, module) {


var imageGraph = require('imagegraph');

function union(u, v) {  // u and v have to be root elements already
	if(u.rank < v.rank) {
		var t = u;
		u = v;
		v = t;
	}
	if(u.rank === v.rank) u.rank++;
	v.parent = u;
	
	u.size += v.size;
	
	u.sumX += v.sumX;
	u.sumY += v.sumY;
	u.sumZ += v.sumZ;
	//u.sumXX += v.sumXX;
	//u.sumYY += v.sumYY;
	//u.sumZZ += v.sumZZ;
}

function find(v) {
	/*
	if(v.parent !== v) {
		v.parent = find(v.parent);
	}
	return v.parent;
	*/
	while(v.parent !== v) v = v.parent;
	return v;
	
}

function MakeSet(x, y, z) {
	this.rank = 0;
	this.parent = this;
	this.size = 1;
	
	this.sumX = x;
	this.sumY = y;
	this.sumZ = z;
	//this.sumXX = Math.round(x*x*.125);  // to be sure not to go over 32 bits
	//this.sumYY = Math.round(y*y*.125);
	//this.sumZZ = Math.round(z*z*.125);
}

/*
4 parent
1 rank
4 size
4 sumX
4 sumY
4 sumZ
*/




function myDistance(v1, v2) {
	// just comparing mean values between two sets
	var n1Inv = 1/v1.size;
	var mu1X = n1Inv * v1.sumX;
	var mu1Y = n1Inv * v1.sumY;
	var mu1Z = n1Inv * v1.sumZ;

	var n2Inv = 1/v2.size;
	var mu2X = n2Inv * v2.sumX;
	var mu2Y = n2Inv * v2.sumY;
	var mu2Z = n2Inv * v2.sumZ;
	
	var dMuX = mu1X - mu2X; // delta mu_X
	var dMuY = mu1Y - mu2Y;
	var dMuZ = mu1Z - mu2Z;
	
	var mX = dMuX*dMuX;
	var mY = dMuY*dMuY;
	var mZ = dMuZ*dMuZ;
	
	return mX + mY + mZ;
	//return Math.max(mX, Math.max(mY, mZ));
}

function myDistance2(v1, v2) {
	// just comparing mean values between two sets
	var n1Inv = 1/v1.size;
	var mu1X = n1Inv * v1.sumX;
	var mu1Y = n1Inv * v1.sumY;
	var mu1Z = n1Inv * v1.sumZ;

	var n2Inv = 1/v2.size;
	var mu2X = n2Inv * v2.sumX;
	var mu2Y = n2Inv * v2.sumY;
	var mu2Z = n2Inv * v2.sumZ;
	
	//var dMuX = mu1X - mu2X;
	//var dMuY = mu1Y - mu2Y;
	//var dMuZ = mu1Z - mu2Z;
	
	var dMuX = mu1X > mu2X ? mu1X-mu2X : mu2X-mu1X;
	var dMuY = mu1Y > mu2Y ? mu1Y-mu2Y : mu2Y-mu1Y;
	var dMuZ = mu1Z > mu2Z ? mu1Z-mu2Z : mu2Z-mu1Z;
	
	return dMuX > dMuY ? dMuX > dMuZ ? dMuX : dMuZ
	                   : dMuY > dMuZ ? dMuY : dMuZ;
	
	//return Math.max(dMuX, Math.max(dMuY, dMuZ));
}


function mahalanobis(v1, v2) {
	// mah is mahalanobis distance between sets v1 and v2
	// this function returns 1/2 * mah^2
	
	var n1 = v1.size;
	var n1Inv = 1/n1;
	var n1_Inv = 1/(n1-1);
	var sum1X = v1.sumX;
	var sum1Y = v1.sumY;
	var sum1Z = v1.sumZ;
	var mu1X = n1Inv * sum1X;
	var mu1Y = n1Inv * sum1Y;
	var mu1Z = n1Inv * sum1Z;
	// unbiased variance:
	var var1X = n1_Inv * (v1.sumXX*8 - sum1X*sum1X*n1Inv);
	var var1Y = n1_Inv * (v1.sumYY*8 - sum1Y*sum1Y*n1Inv);
	var var1Z = n1_Inv * (v1.sumZZ*8 - sum1Z*sum1Z*n1Inv);

	var n2 = v2.size;
	var n2Inv = 1/n2;
	var n2_Inv = 1/(n2-1);
	var sum2X = v2.sumX;
	var sum2Y = v2.sumY;
	var sum2Z = v2.sumZ;
	var mu2X = n2Inv * sum2X;
	var mu2Y = n2Inv * sum2Y;
	var mu2Z = n2Inv * sum2Z;
	// unbiased variance:
	var var2X = n2_Inv * (v2.sumXX*8 - sum2X*sum2X*n2Inv);
	var var2Y = n2_Inv * (v2.sumYY*8 - sum2Y*sum2Y*n2Inv);
	var var2Z = n2_Inv * (v2.sumZZ*8 - sum2Z*sum2Z*n2Inv);
	
	
	var dMuX = mu1X - mu2X; // delta mu_X
	var dMuY = mu1Y - mu2Y;
	var dMuZ = mu1Z - mu2Z;
	
	var mX = dMuX*dMuX / (var1X+var2X);
	var mY = dMuY*dMuY / (var1Y+var2Y);
	var mZ = dMuZ*dMuZ / (var1Z+var2Z);

	/*
	var dMuX = v1.muX - v2.muX; // delta mu_X
	var dMuY = v1.muY - v2.muY;
	var dMuZ = v1.muZ - v2.muZ;
	
	var mX = dMuX*dMuX / (v1.varX + v2.varX);
	var mY = dMuY*dMuY / (v1.varY + v2.varY);
	var mZ = dMuZ*dMuZ / (v1.varZ + v2.varZ);
	*/
	
	var mah2half = (isNaN(mX)?0:mX) + (isNaN(mY)?0:mY) + (isNaN(mZ)?0:mZ);
	
	return mah2half;
}


function mahalanobisFake(v1, v2) {
	var n1Inv = 1/v1.size;
	var n2Inv = 1/v2.size;
	
	var mu1X = n1Inv * v1.sumX;
	var mu1Y = n1Inv * v1.sumY;
	var mu1Z = n1Inv * v1.sumZ;
	var var1X = n1Inv*v1.sumXX*8;
	var var1Y = n1Inv*v1.sumXX*8;
	var var1Z = n1Inv*v1.sumXX*8;
	
	var mu2X = n2Inv * v2.sumX;
	var mu2Y = n2Inv * v2.sumY;
	var mu2Z = n2Inv * v2.sumZ;
	var var2X = n2Inv*v2.sumXX*8;
	var var2Y = n2Inv*v2.sumXX*8;
	var var2Z = n2Inv*v2.sumXX*8;
	
	var dMuX = mu1X - mu2X; // delta mu_X
	var dMuY = mu1Y - mu2Y;
	var dMuZ = mu1Z - mu2Z;
	
	var mX = dMuX*dMuX / (var1X+var2X);
	var mY = dMuY*dMuY / (var1Y+var2Y);
	var mZ = dMuZ*dMuZ / (var1Z+var2Z);	
	
	var mah2half = (isNaN(mX)?0:mX) + (isNaN(mY)?0:mY) + (isNaN(mZ)?0:mZ);
	
	return mah2half;
}

function segmentation(imageData, edges, fake) {  // fake means use fake mah distance
	var data = imageData.data;
	var width = imageData.width;
	var height = imageData.height;
	
	var v = [];  // TODO: if(need for speed) make this typed array?
	for(var i=0; 4*i<data.length; ++i) {
		var r = data[4*i];
		var g = data[4*i+1];
		var b = data[4*i+2];
		v.push(new MakeSet(r, g, b));
	}
	
	for(var j=0; j<edges.length; ++j) {
		var e = edges[j];
		var i1 = e&0x7ffff;
		var i2 = e&0x80000 ? i1+width : i1+1;
		var v1 = find(v[i1]);
		var v2 = find(v[i2]);
		if(v1 === v2) continue;
		//var weight = (e>>>20)|0;
		
		if(fake) {
			var mah2half = mahalanobisFake(v1, v2);
			if(mah2half<.08) union(v1, v2);
		} else {
			if(myDistance(v1, v2)<1000) union(v1, v2);
			//if(myDistance2(v1, v2)<30) union(v1, v2);
			//var mah2half = mahalanobis(v1, v2);
			//if(mah2half<8) union(v1, v2);
		}
		
	}
	
	//var segments = makeSegments(v);
	//var dataOut = segments2data(segments);
	//return new ImageData(dataOut, width, height);
	
	imageData.data.set(avgColorImage(v, width, height));
	return imageData;
	//return avgColorImage(v, width, height);
}

function avgColorImage(v, width, height) {
	var dataOut = new Uint8ClampedArray(4*v.length);
	for(var i=0; i<v.length; ++i) {
		var u = v[i];
		var root = find(u);
		var nInv = 1/root.size;
		if(!root.colorX) {
			root.colorX = nInv * root.sumX | 0;
			root.colorY = nInv * root.sumY | 0;
			root.colorZ = nInv * root.sumZ | 0;
		}
		dataOut[4*i  ] = root.colorX;
		dataOut[4*i+1] = root.colorY;
		dataOut[4*i+2] = root.colorZ;
		dataOut[4*i+3] = 255;
	}
	return dataOut;
}

function segments2data(segments) {
	var dataOut = new Uint8ClampedArray(4*segments.length);	
	for(var i=0; 4*i<dataOut.length; ++i) {
		var segId = segments[i];
		dataOut[4*i  ] = 255*.5*(1+Math.sin(segId));
		dataOut[4*i+1] = 255*.5*(1+Math.sin(2*segId));
		dataOut[4*i+2] = 255*.5*(1+Math.sin(3*segId));
		dataOut[4*i+3] = 255;
	}
	return dataOut;
}

function makeSegments(v) {
	var segments = new Int32Array(v.length);
	var sIdSeq = 0;
	for(var i=0; i<v.length; ++i) {
		var u = v[i];
		var root = find(u);
		var segmentId = root.segmentId;
		if(segmentId) segments[i] = segmentId;
		else {
			sIdSeq++;
			root.segmentId = sIdSeq;
			segments[i] = sIdSeq;
		}
	}
	return segments;
}

module.exports = function(imageData, fake) {
	//var t0 = new Date();
	var edges = imageGraph(imageData);
	//var t1 = new Date();
	var s = segmentation(imageData, edges, fake);
	//var t2 = new Date();
	//console.log('edges        ', t1-t0);
	//console.log('segmentation ', t2-t1);
	return s;
}


});
