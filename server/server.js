const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mbtiles = require("./mbtiles");
const PORT = 8080;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static(path.join(__dirname, '../static')));  
mbtiles(app);
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
