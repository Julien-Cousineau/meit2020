require('dotenv').config()
const azure = require('azure-storage');
const blobSvc = azure.createBlobService();
const prettyBytes = require('pretty-bytes');

blobSvc.listBlobsSegmented('ecmeit', null, function(error, result, response){
  if(!error){
    const entries = result.entries;
    const a = entries.sort(function(a, b) { return new Date(a.lastModified) - new Date(b.lastModified) });
    let total=0;
    a.forEach(entry=>{
      total+=parseFloat(entry.contentLength);
      console.log(entry.name,entry.lastModified,prettyBytes(parseFloat(entry.contentLength)))}
    );
    console.log('Total:',prettyBytes(total));
  }
});
