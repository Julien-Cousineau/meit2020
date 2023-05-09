const fs = require('fs');
const path = require('path');

const MapDServer = require("./dbconnect.js")

const db = new MapDServer();


const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const argv=process.argv;
const options=argv[2] || 0;
const MEIT_YEAR=argv[3];
const scrapper=argv[4] || 0;
const name=argv[4];





const MEIT_CSV = process.env.MEIT_CSV;


const f=async()=>{
  if(options==0){
    const [err0]=await to(db.dropTable(`DB_${MEIT_YEAR}`))
    console.log(err0)
    const template = scrapper==1?'template.2022.scrubber.sql':'template.2022.sql';
    const [err1]=await to(db.createTable(`DB_${MEIT_YEAR}`,path.resolve('data','schema',template)))  
    console.log(err1,scrapper)
  } else if (options==1){
    const file = path.resolve(MEIT_CSV,name);
    const [err2]=await to(db.copyData(`DB_${MEIT_YEAR}`,file))
  console.log(err2)
    
  } else if(options==2){
    const file = path.resolve(MEIT_CSV,name);
    const [err2]=await to(db.groupBy(`DB_${MEIT_YEAR}`,file))
    console.log(err2)
  }
  
  
    
}
f()
