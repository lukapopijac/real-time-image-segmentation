var connect = require('connect');
var app = connect.createServer();
app.use(connect.static(__dirname));
app.listen(80);
