'use strict';

/*
const express = require('express');
const publicDir = require('path').join(__dirname, 'build');
const port = process.env.PORT || 3000;

let app = express();

app.use(express.static(publicDir));

app.listen(port, function() {
	console.log('server started on port', port);
});
*/

const https = require('https');
const pem = require('pem');
const express = require('express');

const port = process.env.PORT || 443;
const publicDir = require('path').join(__dirname, 'build');
 
pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
	let app = express();

	app.use(express.static(publicDir));

	https.createServer({key: keys.serviceKey, cert: keys.certificate}, app)
		.listen(port, function() {
			console.log('server started on port', port);
		});
});
