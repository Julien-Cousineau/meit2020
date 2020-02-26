const azure = require('azure-storage');
const fs = require('fs');
const blobSvc = azure.createBlobService();

const path = require('path');


const name = "pacific_growth_factors_02062018.csv"
const file = path.join('data','ship',name);

if (!fs.existsSync(file))throw new Error("File does not exist")

const stream = fs.createReadStream(file);
stream.pipe(blobSvc.createWriteStreamToBlockBlob('ecmeit', name));