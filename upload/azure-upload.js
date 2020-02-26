const azure = require('azure-storage');
const fs = require('fs');
const blobSvc = azure.createBlobService();

const path = require('path');


// const name = "arctic_voc_2019-03-18b.csv"
// const name = "east_voc_2019-03-18b.csv"
const name = "pacific_voc_2019-03-18b.csv"
const file = path.join('data','csv',name);

if (!fs.existsSync(file))throw new Error("File does not exist")

const stream = fs.createReadStream(file);
stream.pipe(blobSvc.createWriteStreamToBlockBlob('ecmeit', name));