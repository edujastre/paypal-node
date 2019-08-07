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

app.listen(3000, () => console.log('Server running on 3000'));