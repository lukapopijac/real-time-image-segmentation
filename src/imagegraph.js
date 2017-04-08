function generateEdges(imageData) {
	var data = imageData.data;
	var width = imageData.width;
	var height = imageData.height;
	
	var edges = new Uint32Array(2*(width-1)*(height-1));
	// 12 bits for weight,
	// 1 bit for direction (0 for horizontal, 1 for veritical)
	// 19 bits for vertex (first pixel of the edge)
	// edges with even indices are horizontal to the right
	// edges with odd indices are vertical to the bottom
	
	var k = 0;
	for(var x=0; x<width-1; ++x) {
		for(var y=0; y<height-1; ++y) {
			var i = y*width+x;
			var w = calculateWeight(data, i, i+1);
			edges[k++] = w<<20 | i;
			var w = calculateWeight(data, i, i+width);
			edges[k++] = w<<20 | 1<<19 | i;
		}
	}
	return edges;
}

function calculateWeight(data, i, j) {
	// distance: dist = sqrt(d1^2 + d2^2 + d3^2)
	// weight: w = min(dist^2 / 16, 2^12 - 1);  (to fit in 12 bits)
	// it holds: 0 <= w <= min(12192, 4095), because |d1| <= 255
	i<<=2; j<<=2;
	var d1 = data[j]-data[i];
	var d2 = data[j+1]-data[i+1];
	var d3 = data[j+2]-data[i+2];
	var w = (d1*d1+d2*d2+d3*d3)>>4;
	return w<=1023 ? w : 1023;  // comment above is wrong
	//return w<=4095 ? w : 4095;
}

function countingSort(a, shiftBits) {  // this sort changes input array
	// TODO: if elems in a could fit in 30 bits, working with buckets b would be much faster
	var b = [];
	for(var i=0, n=a.length; i<n; ++i) {
		var x = a[i];
		var v = x>>>shiftBits;
		if(!b[v]) b[v] = [];
		b[v].push(x);
	}
	var k = 0;
	for(var i=0; i<b.length; ++i) {
		var c = b[i];
		if(!c) continue;
		// TODO: random permute elements in c?
		for(var j=c.length; j--;) a[k++] = c[j];
	}
	
	return a;
}


module.exports = function(imageData) {
	var edges = generateEdges(imageData);
	countingSort(edges, 20);  // weights are in top 12 bits
	return edges;
};
