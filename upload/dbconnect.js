const fs = require('fs');
const Connector = require("./node-connector");

const DBNAME = process.env.DBNAME;
const USER = process.env.MAPD_USER;
const PASSWORD = process.env.MAPD_USER.MAPD_PASSWORD;

const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

class MapDServer {
  connect=()=>{
    const connector = new Connector();
    return new Promise((resolve, reject)=>{
      connector
      .protocol("http")
      .host("localhost")
      .port("9090")
      .dbName(DBNAME)
      .user(USER)
      .password(PASSWORD)
      .connect((err, results) => { 
          if(err)return reject(err);
          resolve(results);
        }); 
    });
  }
  query=async(query,options)=>{
    const {connect}=this;
    const [err,con] = await to(connect());
    if(err)return err;
    const [e,results] = await to(new Promise((resolve,reject)=>{
      con.query(query, options, (err, result)=>{
        if(err)return reject(err);
        resolve(results);
      });
    }));
    if(e)throw e;
    return results;
  }
  createTable=(tablename,schemafilepath)=>{
    let queryStr = fs.readFileSync(schemafilepath, 'utf8').replace("tablename",tablename);
    return this.query(queryStr,{});
  }
  copyData=(tablename,csvpath)=>{
    let queryStr = "copy {0} from '{1}'".format(tablename,csvpath);
    return this.query(queryStr,{});
  }
  dropTable=(tablename)=>{
    const queryStr = "DROP TABLE IF EXISTS {0}".format(tablename);
    return this.query(queryStr,{});
  }
};

module.exports = MapDServer;