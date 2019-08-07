const express = require('express');
var cors = require('cors');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', require('./routes'));

var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});

// app.listen(process.env.PORT || 3000, () => console.log('Server running on 3000'));