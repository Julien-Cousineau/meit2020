const fs = require('fs');
const path = require('path')

const mbtiles = require('@mapbox/mbtiles');
const express = require('express');
const MapDServer = require("./dbconnect.js")

const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const router = express.Router();

const db = new MapDServer();

router.use(async function(req, res, next) {
  const {dim,exp,emission,table,_limit,_con,_filtersstr}=req.query;
  if(!dim)return res.status(204).send('Needs dim parameter');
  if(!exp)return res.status(204).send('Needs exp parameter');
  if(!emission)return res.status(204).send('Needs emission parameter');
  if(!table)return res.status(204).send('Needs table parameter');       
  const limit = _limit || "";
  const con=_con || "";
  const filtersstr=_filtersstr || "";
  
  const queryStr = `SELECT ${dim} as key0,SUM(${expression}) AS ${emission} FROM ${table} WHERE ${con}${filtersstr}${expression} IS NOT NULL GROUP BY key0 ORDER BY ${emission} DESC LIMIT ${limit}`;
  
  const [err,results]= await to(db.query(queryStr,{}));
  if(err) return res.status(500).send(err.message);
  return res.status(200).json(results); 
});


module.exports = router;
