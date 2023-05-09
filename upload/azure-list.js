const { BlobServiceClient }     = require("@azure/storage-blob");
const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
const blobSvc = BlobServiceClient.fromConnectionString(connectionString);

const prettyBytes = require('pretty-bytes');

const containerClient = blobSvc.getContainerClient('ecmeit');
const main=async()=>{
  const entries=[];
  for await (const blob of containerClient.listBlobsFlat()) {
    entries.push(blob)
  }
  // console.log(entries)
  const a = entries.sort(function(a, b) { return new Date(a.properties.lastModified) - new Date(b.properties.lastModified) });
  let total=0;
  a.forEach(entry=>{
    total+=parseFloat(entry.properties.contentLength);
    console.log(entry.name,entry.properties.lastModified,prettyBytes(parseFloat(entry.properties.contentLength)))}
  );
  console.log('Total:',prettyBytes(total));  
}
main();