const azure = require('azure-storage');
const fs = require('fs');
const path = require('path');
const blobSvc = azure.createBlobService();



const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const jsonPath = path.join('data','data.json');

let rawdata = fs.readFileSync(jsonPath);
let FILES = JSON.parse(rawdata);
Object.keys(FILES).forEach(key=>{
  const group = FILES[key];
  
  group.forEach(async (item)=>{
    const name = item.azure; 
    const file = path.resolve('data',item.local);
    if (!fs.existsSync(file)){
      const [err,r] = await to(new Promise((resolve,reject)=>{
        blobSvc.getBlobToStream('ecmeit', name, fs.createWriteStream(file), function(error, result, response){
        if(error)reject(response);
        resolve(true);
        });
      }));
    if(err)throw err;
    return true;
  }

});
})