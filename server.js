'use strict';

const express = require('express');

const port = process.env.PORT || 8080;
const publicDir = require('path').join(__dirname, 'build');
 
let app = express();

app.use(express.static(publicDir));

app.listen(port, function() {
	console.log('server started on port', port);
});
