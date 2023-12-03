const express = require('express');

const app = express();

app.use('/', express.static('./pages'))

app.use('/css', express.static('./css'))
app.use('/js', express.static('./js'))
app.use('/assets', express.static('./assets'))
app.use('/files', express.static('./files'))

app.listen(3000)

var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
require('child_process').exec(start + ' ' + 'http://localhost:3000');