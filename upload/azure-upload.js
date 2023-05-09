const fs = require('fs');
const path = require('path');

const { BlobServiceClient }     = require("@azure/storage-blob");
const accountName = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
const blobSvc = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobSvc.getContainerClient('ecmeit');




// const name = "arctic_voc_2019-03-18b.zip"
// const name = "east_voc_2019-03-18b.zip"
// const name = "pacific_voc_2019-03-18b.zip"
// const file = path.join('data','csv',name);

const blobName = 'east_arctic_greatlakes_forecast_factors_02062018.csv'
const filePath = path.join('data','ship',blobName);

if (!fs.existsSync(filePath))throw new Error("File does not exist")


const func=async()=>{
    const blobClient = containerClient.getBlockBlobClient(blobName);    
    await blobClient.uploadFile(filePath);
}
func()
