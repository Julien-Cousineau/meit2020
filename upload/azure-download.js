const fs = require('fs');
const path = require('path');

const { BlobServiceClient }     = require("@azure/storage-blob");
const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
const blobSvc = BlobServiceClient.fromConnectionString(connectionString);

const containerClient = blobSvc.getContainerClient('ecmeit');

const cliProgress = require('cli-progress');
 
// create new progress bar
const MEIT_DATA=process.env.MEIT_DATA;


const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const jsonPath = path.join('data','data.json');

let rawdata = fs.readFileSync(jsonPath);
let FILES = JSON.parse(rawdata);
const f=async()=>{
  for(let i in FILES){
    const group = FILES[i];
    for(let i in group){
      const item=group[i]  
    
      const name = item.azure;       
      const file = path.resolve(MEIT_DATA,item.local);
      const folder = path.dirname(file)
      
      fs.mkdirSync(folder, { recursive: true });
      if (!fs.existsSync(file)){
        const bar = new cliProgress.SingleBar({format:  '{bar}' + '| {percentage}% || {value}/{total} Chunks || '+name}, cliProgress.Presets.shades_classic);
        bar.start(100, 0);
        const myFunc = async()=>{
          
          const blobClient = containerClient.getBlobClient(name);
          
          const response      = await blobClient.download();
          const writeStream   = fs.createWriteStream(file);
          let downloadedBytes = 0;
          const totalBytes    = response.contentLength;                                      
          
          response.readableStreamBody.pipe(writeStream);          
          
          response.readableStreamBody.on("data", (chunk) => {
            downloadedBytes += chunk.length;            
            const percentComplete = ((downloadedBytes / totalBytes) * 100);
            bar.update(percentComplete);            
          });
          
          return new Promise((resolve, reject) => {
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
          });                           
        }
        const [err,response]=await to(myFunc());
        
        bar.update(100);
        bar.stop();
        if(err)throw err;        
      }           
    };
  }
  process.exit()
}
f();
