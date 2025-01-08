const fs = require('fs');
const path = require('path');

const MapDServer = require("./dbconnect.js")

const db = new MapDServer();


const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const argv=process.argv;
const options=argv[2] || 0;
const MEIT_YEAR=argv[3];
const name=argv[4];




const MEIT_CSV = process.env.MEIT_CSV;


const f=async()=>{
  if(options==0){
    const [err0,info0]=await to(db.dropTable(`DB_${MEIT_YEAR}`))
    console.log("ERROR",err0,info0)
    const [err1,info1]=await to(db.createTable(`DB_${MEIT_YEAR}`,path.resolve('data','schema','template.2024.scrubber.sql')))  
    console.log("ERROR",err1,info1)
  } else{
  const file = path.resolve(MEIT_CSV,name);
  const [err2]=await to(db.copyData(`DB_${MEIT_YEAR}`,file))
  console.log("ERROR",err2)

    
  }
  
  
    
}
f()
