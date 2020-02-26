const path = require('path');
const db = require("./dbconnect");
const schema = path.join(__dirname, 'data','schema','template.2019.sql');


const list = path.join(__dirname, 'data','csv','list.json');

const to=(promise)=>promise.then(data => [null, data]).catch(err => [err]);

const f=async(name)=>{
    if(!list[name])throw new Error("Name does not exist in list.json");
    
    const [err,r] = await to(db.createTable(name,schema));
    if(err)throw err;
    console.log(r);
    
    const array = list[name];
    for(let i in array){
        const [err,r] = await to(db.copyData("2015",array[i]));
        if(err)throw err;
    };
};


f("2015");


