# Download
# az storage blob download --container-name ecmeit --name MEIT_Arctic_Data_2022-11-07 --file data/csv/MEIT_Artic.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_Pacific_Data_2022-11-07 --file data/csv/MEIT_Pacific.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_2015_East_Data_2022-11-07 --file data/csv/2015_MEIT_East.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_2016_East_Data_2022-11-07 --file data/csv/2016_MEIT_East.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_2017_East_Data_2022-11-07 --file data/csv/2017_MEIT_East.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_2018_East_Data_2022-11-07 --file data/csv/2018_MEIT_East.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_2019_East_Data_2022-11-07 --file data/csv/2019_MEIT_East.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name MEIT_2020_East_Data_2022-11-07 --file data/csv/2020_MEIT_East.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY

# Unzip
# unzip MEIT_Artic.zip
# unzip MEIT_Pacific.zip
# cd data/csv
# unzip 2015_MEIT_East.zip
# unzip 2016_MEIT_East.zip
# unzip 2017_MEIT_East.zip
# unzip 2018_MEIT_East.zip
# unzip 2019_MEIT_East.zip
# unzip 2020_MEIT_East.zip
# cd ../..



# Arctic
# node process/index.js data/csv/MEIT_Arctic_Data_2022-11-07/No_Scrubber_2015_arctic_emissions_2022-11-04.csv data/csv/MEIT_Arctic/arctic_2015.csv --max-old-space-size=4000
# node process/index.js data/csv/MEIT_Arctic_Data_2022-11-07/No_Scrubber_2016_arctic_emissions_2022-11-04.csv data/csv/MEIT_Arctic/arctic_2016.csv --max-old-space-size=4000
# node process/index.js data/csv/MEIT_Arctic_Data_2022-11-07/No_Scrubber_2017_arctic_emissions_2022-11-04.csv data/csv/MEIT_Arctic/arctic_2017.csv --max-old-space-size=4000
# node process/index.js data/csv/MEIT_Arctic_Data_2022-11-07/No_Scrubber_2018_arctic_emissions_2022-11-04.csv data/csv/MEIT_Arctic/arctic_2018.csv --max-old-space-size=4000
# node process/index.js data/csv/MEIT_Arctic_Data_2022-11-07/No_Scrubber_2019_arctic_emissions_2022-11-04.csv data/csv/MEIT_Arctic/arctic_2019.csv --max-old-space-size=4000
# node process/index.js data/csv/MEIT_Arctic_Data_2022-11-07/With_Scrubber_2020_arctic_emissions_2022-11-04.csv data/csv/MEIT_Arctic/arctic_2020.csv true --max-old-space-size=4000

# Pacific
function run(){
    FOLDER=$1
    NEWFOLDER=$2
    mkdir -p data/csv/$NEWFOLDER
    for FILE in data/csv/$FOLDER/*.csv
    do
    basename "$FILE"
    NAME="$(basename -- $FILE)"
    filename=${NAME%%.*}
    NEWFILE=data/csv/$NEWFOLDER/$filename.2.csv
    ZIPFILE=data/csv/$NEWFOLDER/$filename.2.zip
    AZFILE=$NEWFOLDER/$filename.2.zip
    if [ ! -f $ZIPFILE ]
    then
        node process/index.js $FILE $NEWFILE true --max-old-space-size=4000
        zip $ZIPFILE $NEWFILE
        # rm $NEWFILE
        az storage blob upload --container-name ecmeit --name $AZFILE --file $ZIPFILE --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
    # else
    fi
    done
    
}
run MEIT_Arctic_Data_2022-11-07 MEIT_Arctic
# run MEIT_Pacific_Data_2022-11-07 MEIT_Pacific
# run MEIT_2015_East_Data_2022-11-07 MEIT_East
# run MEIT_2016_East_Data_2022-11-07 MEIT_East
# run MEIT_2017_East_Data_2022-11-07 MEIT_East
# run MEIT_2018_East_Data_2022-11-07 MEIT_East
# run MEIT_2019_East_Data_2022-11-07 MEIT_East
# run MEIT_2020_East_Data_2022-11-07 MEIT_East



# Test
# node upload/data2db.js 0 2015
# node upload/data2db.js 0 2016
# node upload/data2db.js 0 2017
# node upload/data2db.js 0 2018
# node upload/data2db.js 0 2019
# node upload/data2db.js 0 2020 1
# node upload/data2db.js 1 2015 MEIT_Arctic/arctic_2015.csv
# node upload/data2db.js 1 2016 MEIT_Arctic/arctic_2016.csv
# node upload/data2db.js 1 2017 MEIT_Arctic/arctic_2017.csv
# node upload/data2db.js 1 2018 MEIT_Arctic/arctic_2018.csv
# node upload/data2db.js 1 2019 MEIT_Arctic/arctic_2019.csv
# node upload/data2db.js 1 2020 MEIT_Arctic/arctic_2020.csv
# node upload/data2db.js 2 2015 MEIT_Arctic/arctic_2015.2.csv
