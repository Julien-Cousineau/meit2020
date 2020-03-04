const fs = require('fs');
const path = require('path');

const MapDServer = require("./dbconnect.js")

const db = new MapDServer();


const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const MEIT_YEAR = process.env.MEIT_YEAR;

const csv = process.env.MEIT_CSVT || 'csv.json'

const jsonPath = path.join('data',csv);

let rawdata = fs.readFileSync(jsonPath);
let json = JSON.parse(rawdata);

const group = json[MEIT_YEAR]['production'];


const f=async()=>{
  const [err0]=await to(db.dropTable(`t${MEIT_YEAR}`))
  const [err1]=await to(db.createTable(`t${MEIT_YEAR}`,path.resolve('data','schema','template.2020.sql')))
  
  for(let i in group){
    const item=group[i];
    const file = path.resolve('data',item.local);
    const [err1]=await to(db.copyData(`t${MEIT_YEAR}`,file))
    }
}
f()