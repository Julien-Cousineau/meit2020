const fs = require('fs');
const path = require('path')
const bodyParser = require('body-parser');

const express = require('express');
const MapDServer = require("./dbconnect.js")

const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const router = express.Router();

const db = new MapDServer();

// router.use(async function(req, res, next) {
//   // const {dim,exp,emission,table,_limit,_con,_filtersstr}=req.query;
//   // if(!dim)return res.status(500).send('Needs dim parameter');
//   // if(!exp)return res.status(500).send('Needs exp parameter');
//   // if(!emission)return res.status(500).send('Needs emission parameter');
//   // if(!table)return res.status(500).send('Needs table parameter');       
//   // const limit = _limit || 50;
//   // const con=_con || "";
//   // const filtersstr=_filtersstr || "";
  
//   // // const queryStr = `SELECT ${dim} as key0,SUM(${exp}) AS ${emission} FROM ${table} WHERE ${con}${filtersstr}${exp} IS NOT NULL GROUP BY key0 ORDER BY ${emission} DESC LIMIT ${limit}`;
//   // const queryStr = `SELECT ${dim} as key0,SUM(${exp}) AS ${emission} FROM ${table} WHERE ${exp} IS NOT NULL GROUP BY key0 ORDER BY ${emission} DESC LIMIT ${limit}`;
//   // console.log(queryStr)
//   // const [err,results]= await to(db.query(queryStr,{}));
//   // console.log(err,results)
//   // if(err) return res.status(500).send(err.message);
//   return res.status(200).json({"a":"cousineau"}); 
// });
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));
router.post('/',async function(req, res, next) {
  // console.log(req)
  // res.redirect(targetUrl);
  console.log(req)
  // const res = await axios.post('http://localhost:9090', );
  return res.status(200).json({"a":"cousineau"});
})


module.exports = router;
