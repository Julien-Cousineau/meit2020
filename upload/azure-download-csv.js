const azure = require('azure-storage');
const fs = require('fs');
const path = require('path');
const blobSvc = azure.createBlobService();
const cliProgress = require('cli-progress');


const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const MEIT_YEAR = process.env.MEIT_YEAR;
const NODE_ENV = process.env.NODE_ENV;
const csv = process.env.MEIT_CSVT || 'csv.json'
const dataPath = process.env.MEIT_CSV;
const jsonPath = path.join('data',csv);

let rawdata = fs.readFileSync(jsonPath);
let json = JSON.parse(rawdata);

const group = json[MEIT_YEAR][NODE_ENV];

const f=async()=>{
  for(let i in group){
    const item=group[i];
    const name = item.azure; 
    const file = path.resolve(dataPath,item.local);
    if (!fs.existsSync(file)){
      const bar = new cliProgress.SingleBar({format:  '{bar}' + '| {percentage}% || {value}/{total} Chunks || '+name}, cliProgress.Presets.shades_classic);
      const [err,r] = await to(new Promise((resolve,reject)=>{
        bar.start(100, 0);
        const blob=blobSvc.getBlobToStream('ecmeit', name, fs.createWriteStream(file), function(error, result, response){
          bar.update(100);
          bar.stop();
          if(error)return reject(response);
          resolve(true);
        });
        const refreshProgress=()=> {
            setTimeout(()=> {
              const process = blob.getCompletePercent();
              bar.update(process);
              refreshProgress();
            }, 200);
          }
  
        refreshProgress();
      }));
      if(err)throw err;
    }
  }
  process.exit()
}
f();

