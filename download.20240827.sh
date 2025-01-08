export MEIT_CSV=/var/lib/heavyai/nrc-data-files/csv
export AZURE_STORAGE_ACCESS_KEY=kP5EdYln0h16eE9nDK3R3Hocbg9BbAsQ2M2eGJys1F8QXVWgPaE4AfPK7giDyX3GFNKoBuX1gsI0OUysTvGtmA==
export AZURE_STORAGE_ACCOUNT=jcousineausandbox
export DBNAME=meit
export MAPD_USER=admin
export MAPD_PORT=6278
export MAPD_PASSWORD=HyperInteractive

function run(){
    
    year=$1    
        
    node upload/data2db.js 0 $year 1 
    for name in arctic pacific east; do
     path="UPLOAD2024_v2/${name}_${year}.2.zip"
     file="${MEIT_CSV}/${name}_${year}.2.zip"
     echo $name
     echo $path
     echo $file
     az storage blob download --container-name ecmeit --name $path --file $file --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
     node upload/data2db.js 1 $year $file
     rm $file
    done
    
}

# run 2015 
# run 2016
# run 2017 
run 2018
run 2019
run 2020
run 2021
run 2022
run 2023
