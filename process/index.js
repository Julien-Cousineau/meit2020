const path = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');
const CONVERT = require('./convert');
const yauzl = require("yauzl-promise");
const yazl = require("yazl");
const azure = require('azure-storage');
const blobSvc = azure.createBlobService();


// const AdmZip = require('adm-zip');

// const zlib = require('zlib');


const MEIT_YEAR = process.env.MEIT_YEAR;

const csv = process.env.MEIT_CSVT || 'csv.json'

const jsonPath = path.join('data',csv);

let rawdata = fs.readFileSync(jsonPath);
let jsonfile = JSON.parse(rawdata);

const group = jsonfile[MEIT_YEAR]['development'];
const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);


const f=async()=>{
  for(let i in group){
    const item = group[i]
    
    const basename = path.basename(item.local, '.zip');
    
    const inputZip = path.resolve('data',item.local);
    const output = path.resolve('data','csv',basename +".2020.csv");
    const outputZip = path.resolve('data','csv',basename +".2020.zip");
    // if (fs.existsSync(outputZip))continue;
    
    const zipFile = await yauzl.open( inputZip )
    const entry = (await zipFile.readEntries( 10 )).filter(e=>!/\/$/.test(e.fileName))[0];
    const input = path.resolve('data',"csv",path.basename(entry.fileName));
    
    if (!fs.existsSync(input)){
      
     const fileSize = entry.uncompressedSize;
     const bar = new cliProgress.SingleBar({format:  '{bar}' + '| {percentage}% || {value}/{total} Chunks || '+input}, cliProgress.Presets.shades_classic);
     
     bar.start(fileSize, 0);
     let _size  = 0;
     
     const readStream = await zipFile.openReadStream( entry );
     
     const r= await (new Promise((resolve,reject)=>{
      const s=fs.createWriteStream(input)
      readStream.pipe(s);
      readStream.on('data',(buffer)=>{
        _size  +=  buffer.length;
        bar.update(_size);
      })
      s.on('finish', resolve);  
      s.on('error', reject);  
     }))
     bar.update(fileSize);
     bar.stop();
    }
    await zipFile.close();
    
    
    if (!fs.existsSync(output)){
      const bar = new cliProgress.SingleBar({format:  '{bar}' + '| {percentage}% || {value}/{total} Chunks || '+item.local}, cliProgress.Presets.shades_classic);
      bar.start(300, 0);
      const options={
          testing:false,
          csvinput:[input],
          csvoutput:[output],
          printfunc:()=>{}
          // printfunc:function(opt){console.log(false,opt)}
      };
      const c=new CONVERT(options)
      const [err,r] = await to(new Promise((resolve,reject)=>{
        c.construct(()=>resolve(true))
      }))
      bar.update(300);
      bar.stop();
      if(err)throw err;
    }
    if (!fs.existsSync(outputZip)){
      const stats = fs.statSync(output);
      const fileSize = stats.size;
      console.log(output,path.basename(output))
      const bar = new cliProgress.SingleBar({format:  '{bar}' + '| {percentage}% || {value}/{total} Chunks || '+outputZip}, cliProgress.Presets.shades_classic);
      bar.start(fileSize, 0);
      const zipfile = new yazl.ZipFile();
      
      const stream = fs.createReadStream(output);
      zipfile.addReadStream(stream,path.basename(output));
      
      let _size = 0;
      
      // zipfile.outputStream.on("data",(buffer)=>{
      //   _size  +=  buffer.length*4;
      //   bar.update(_size);
      // })
      const [e,t] = await to((new Promise((resolve,reject)=>{
        zipfile.outputStream.pipe(fs.createWriteStream(outputZip))
        .on("close",resolve)
        .on("error",reject)
        stream.on("end",resolve);
        })))
      if(e)console.log(e)
      bar.update(fileSize);
      bar.stop();
    }
    
    

    const a = await(new Promise((resolve,reject)=>{
      blobSvc.listBlobsSegmented('ecmeit', null, function(error, result, response){
        if(error)return reject(error);
        const entries = result.entries;
        resolve(entries.some(e=>e.name==path.basename(outputZip)))
      });
    }));
    if(a==false || item.overwrite){
      console.log( path.basename(outputZip))
      const stats = fs.statSync(outputZip);
      const fileSize = stats.size;
      const bar = new cliProgress.SingleBar({format:  '{bar}' + '| {percentage}% || {value}/{total} Chunks || '+path.basename(outputZip)}, cliProgress.Presets.shades_classic);
      const b=await to((new Promise((resolve,reject)=>{
        let _size=0;
        bar.start(fileSize, 0);
        const stream = fs.createReadStream(outputZip);
        // stream.on("data",(buffer)=>{
        //   _size+=buffer.length;
        //   bar.update(_size);
        // });
        stream.on("end",resolve);
        stream.on("error",reject);
        stream.pipe(blobSvc.createWriteStreamToBlockBlob('ecmeit', path.basename(outputZip)));  
      })))
      console.log(b)
      bar.update(fileSize);
      bar.stop();
    }
    
  }
  process.exit()
}
f()

