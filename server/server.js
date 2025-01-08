const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mbtiles = require("./mbtiles");
// const api = require("./api");


const PORT = 8080;

const app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use('/',express.static(path.join('public')));
app.use('/sim',express.static(path.join('sim')));  
app.use('/tiles/', mbtiles);
// app.use('/api', api);


app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
