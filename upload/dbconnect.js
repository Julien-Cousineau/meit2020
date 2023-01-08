const fs = require('fs');
// const Connector = require("./node-connector");
const { MapdCon } = require("@mapd/connector");

const DBNAME = process.env.DBNAME;
const USER = process.env.MAPD_USER;
const PASSWORD = process.env.MAPD_PASSWORD;
const MAPD_PORT=process.env.MAPD_PORT;
const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);


class MapDServer {
  connect(){
    const connector = new MapdCon();
    return new Promise((resolve, reject)=>{
      connector
      .protocol("http")
      .host("localhost")
      .port(MAPD_PORT)
      .dbName(DBNAME)
      .user(USER)
      .password(PASSWORD)
      .connect((err, results) => { 
          console.log(err)
          if(err)return reject(err);
          resolve(results);
        }); 
    });
  }
  async query(query,options){
    const {connect}=this;
    const [err,con] = await to(connect());
    if(err)return err;
    const [e,results] = await to(new Promise((resolve,reject)=>{
      con.query(query, options, (err, r)=>{
        if(err)return reject(err);
        resolve(r);
      });
    }));
    if(e)throw e;
    return results;
  }
  createTable(tablename,schemafilepath){
    let queryStr = fs.readFileSync(schemafilepath, 'utf8').replace("tablename",tablename);
    console.log(queryStr);
    return this.query(queryStr,{});
  }
  groupBy(tablename,csvpath){
    let queryStr = `COPY (SELECT ship_id,trip_id,ocountry,dcountry,otrip,dtrip,class,type,ip,mode,engine,lng,lat,meit,mapmeit,prov,hex_16,hex_4,hex_1,SUM(nox) as nox,SUM(co) as co,SUM(hc) as hc,SUM(nh3) as nh3,SUM(co2) as co2,SUM(ch4) as ch4,SUM(n2o) as n2o,SUM(sox) as sox,SUM(pm25) as pm25,SUM(pm10) as pm10,SUM(pm) as pm,SUM(bc) as bc,SUM(fuel_cons) as fuel_cons,SUM(voc) as voc from ${tablename} GROUP BY ship_id,trip_id,ocountry,dcountry,otrip,dtrip,class,type,ip,mode,engine,lng,lat,meit,mapmeit,prov,hex_16,hex_4,hex_1) TO '${csvpath}';`;
    console.log(queryStr);
    return this.query(queryStr,{})
  }
  copyData(tablename,csvpath){
    let queryStr = `copy ${tablename} from '${csvpath}'`;
    console.log(queryStr);
    return this.query(queryStr,{});
  }
  dropTable(tablename){
    const queryStr = `DROP TABLE IF EXISTS ${tablename}`;
    console.log(queryStr);
    return this.query(queryStr,{});
  }
};

module.exports = MapDServer;
