const path = require('path');
const fs = require('fs');

const CONVERT = require('./convert');



const argv=process.argv;
const input=argv[2]
const output=argv[3]
const scrapper=argv[4]==='true'?true:false;

const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);


const f=async()=>{
  const options={
          testing:false,
          scrapper:scrapper,
          csvinput:[input],
          csvoutput:[output],
          printfunc:()=>{}
      };
      const c=new CONVERT(options)
      const [err,r] = await to(new Promise((resolve,reject)=>{
        c.construct(()=>resolve(true))
      }))
 
}
f()

