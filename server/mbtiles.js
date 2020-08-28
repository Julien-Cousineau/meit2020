const fs = require('fs');
const path = require('path')
//const mbtiles = require('@mapbox/mbtiles');
const mbtiles = require('@mapbox/mbtiles');
const express = require('express');

var router = express.Router();

// const MBTILESFOLDER =  path.join(__dirname, '../../shareddrive/data/hex');
// const MBTILESFOLDER =  path.join('data/mbtiles');
const MBTILESFOLDER=process.env.MEIT_MBTILES;



const tiles ={
  hex16:  'newhex16.mbtiles' ,
  hex4:   'newhex4.mbtiles' ,
  hex1:  'newhex1.mbtiles' ,
  meit:  'meitregions.mbtiles' ,
  prov:   'provinces.mbtiles' ,
  cmeit: 'cmeitregions.mbtiles' ,
  cprov:  'cprovinces.mbtiles' ,
  terminals:  'terminals.mbtiles' ,
};
const fixTileJSONCenter = function(tileJSON) {
  if (tileJSON.bounds && !tileJSON.center) {
    var fitWidth = 1024;
    var tiles = fitWidth / 256;
    tileJSON.center = [
      (tileJSON.bounds[0] + tileJSON.bounds[2]) / 2,
      (tileJSON.bounds[1] + tileJSON.bounds[3]) / 2,
      Math.round(
        -Math.log((tileJSON.bounds[2] - tileJSON.bounds[0]) / 360 / tiles) /
        Math.LN2
      )
    ];
  }
};



  for(let id in tiles){
    let mbtilesFile = path.resolve(MBTILESFOLDER,tiles[id]);
    let mbtilesFileStats = fs.statSync(mbtilesFile);
    if (!mbtilesFileStats.isFile() || mbtilesFileStats.size == 0) {
      throw Error('Not valid MBTiles file: ' + mbtilesFile);
    }
  
    let tileJSON = {};
    let source = new mbtiles(mbtilesFile, function(err) {
      if(err){console.log("Error 00:"+err)}
      source.getInfo(function(err, info) {
        if(err){console.log("Error 0: "+err)}
        tileJSON['name'] = id;
        tileJSON['format'] = 'pbf';
    
        Object.assign(tileJSON, info);
        tileJSON['tilejson'] = '2.0.0';
        delete tileJSON['filesize'];
        delete tileJSON['mtime'];
        delete tileJSON['scheme'];
    
        Object.assign(tileJSON, {});
        fixTileJSONCenter(tileJSON);
      });
    });
  
  
    let tilePattern = '/' + id + '/:z(\\d+)/:x(\\d+)/:y(\\d+).:format([\\w.]+)';
     
    // let route = express().disable('x-powered-by');
    router.get(tilePattern, function(req, res, next) {
      
      let z = req.params.z | 0,
          x = req.params.x | 0,
          y = req.params.y | 0;
    
    
      if (z < tileJSON.minzoom || 0 || x < 0 || y < 0 ||
          z > tileJSON.maxzoom ||
          x >= Math.pow(2, z) || y >= Math.pow(2, z)) {
        
        return res.status(204).send('Out of bounds');
      }
      source.getTile(z, x, y, function(err, data, headers) {
        // console.log(x+ " " + y + " " + z)
        if (err) {
          if (/does not exist/.test(err.message)) {
             return res.status(204).send(err.message);
          } else {
            return res.status(500).send(err.message);
          }
        } else {
            if (data == null) {
               return res.status(204).send('Not found');
            } else {
                headers['Content-Type'] = 'application/x-protobuf';  
                delete headers['ETag']; 
                headers['Content-Encoding'] = 'gzip';
                res.set(headers);
               return res.status(200).send(data);
               }
        }
      });
    });
   
    // app.use('/tiles/',route)
  }




module.exports = router;