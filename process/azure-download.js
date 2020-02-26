require('dotenv').config()
const azure = require('azure-storage');
const fs = require('fs');
const blobSvc = azure.createBlobService();


const path = require('path');

const UPLOADFOLDER = '../shareddrive/data/hex/'
const FOLDER = 'data'

const list =[
  {name:"arctic_emissions_2018-05-28",file:"arctic_emissions_2018-05-28.zip"},
  
  ];
list.forEach(async (item)=>{
  const name = item.name; 
  const file = path.resolve(FOLDER,item.file);

  await new Promise((resolve,reject)=>{
    blobSvc.getBlobToStream('ecmeit', name, fs.createWriteStream(file), function(error, result, response){
      if(error)reject(response);
      resolve(true);
    });
  });
});
