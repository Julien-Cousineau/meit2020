const path = require('path');
const CONVERT = require('./convert');


const filename = 'arctic_emissions_2019-04-25.csv';

const input = path.resolve('data',filename);
const output = path.resolve('data',filename +"2");
const options={
     testing:true,
     csvinput:[input],
     csvoutput:[output],
     printfunc:function(opt){console.log(false,opt)}
};
new CONVERT(options,()=>{})