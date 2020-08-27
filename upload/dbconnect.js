const fs = require('fs');
// const Connector = require("./node-connector");
const Connector = require("@mapd/connector");

const DBNAME = process.env.DBNAME;
const USER = process.env.MAPD_USER;
const PASSWORD = process.env.MAPD_PASSWORD;
const MAPD_PORT=process.env.MAPD_PORT;
const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

class MapDServer {
  connect(){
    const connector = new Connector();
    return new Promise((resolve, reject)=>{
      connector
      .protocol("http")
      .host("localhost")
      .port(MAPD_PORT)
      .dbName(DBNAME)
      .user(USER)
      .password(PASSWORD)
      .connect((err, results) => { 
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
