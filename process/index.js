const path = require('path');
const CONVERT = require('./convert');
const UPLOADFOLDER =  path.join(__dirname, 'data');
const CONVERTFOLDER = path.join(__dirname, 'data');

const filename = 'arctic_emissions_2019-04-25.csv';

const input = path.resolve(UPLOADFOLDER,filename);
const output = path.resolve(CONVERTFOLDER,filename +"2");
const options={
     testing:true,
     csvinput:[input],
     csvoutput:[output],
     printfunc:function(opt){console.log(false,opt)}
};
new CONVERT(options,()=>{})