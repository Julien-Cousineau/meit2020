const AdmZip = require('adm-zip');
const path = require('path');

// const name="arctic_voc_2019-03-18"
// const name="east_voc_2019-03-18"
const name="pacific_voc_2019-03-18"


const file = path.join('data','csv',name+".csv");
const zip = new AdmZip();
zip.addLocalFile(file);
zip.writeZip(path.join('data','csv',name+".zip"));