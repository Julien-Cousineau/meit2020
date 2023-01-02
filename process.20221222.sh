# az storage blob download --container-name ecmeit --name 2015_MEIT_Emissions --file data/csv/2015_MEIT_Emissions.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name 2016_MEIT_Emissions --file data/csv/2016_MEIT_Emissions.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name 2017_MEIT_Emissions --file data/csv/2017_MEIT_Emissions.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob download --container-name ecmeit --name 2018_MEIT_Emissions --file data/csv/2018_MEIT_Emissions.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY

# node process/index.js data/csv/2015_MEIT_Emissions/arctic_emissions_2020-06-11.csv data/csv/2015_MEIT_Emissions/arctic_emissions_2020-06-11.2015.csv --max-old-space-size=4000
# node process/index.js data/csv/2015_MEIT_Emissions/east_emissions_2020-06-11.csv data/csv/2015_MEIT_Emissions/east_emissions_2020-06-11.2015.csv --max-old-space-size=4000
# node process/index.js data/csv/2015_MEIT_Emissions/pacific_emissions_2020-06-11.csv data/csv/2015_MEIT_Emissions/pacific_emissions_2020-06-11.2015.csv --max-old-space-size=4000

# cd data/csv/2015_MEIT_Emissions
# zip arctic_emissions_2020-06-11.2015.zip arctic_emissions_2020-06-11.2015.csv
# zip east_emissions_2020-06-11.2015.zip east_emissions_2020-06-11.2015.csv
# zip pacific_emissions_2020-06-11.2015.zip pacific_emissions_2020-06-11.2015.csv
# az storage blob upload --container-name ecmeit --name arctic_emissions_2020-06-11.2015.zip --file arctic_emissions_2020-06-11.2015.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob upload --container-name ecmeit --name east_emissions_2020-06-11.2015.zip --file east_emissions_2020-06-11.2015.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob upload --container-name ecmeit --name pacific_emissions_2020-06-11.2015.zip --file pacific_emissions_2020-06-11.2015.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# rm arctic_emissions_2020-06-11.2015.zip
# rm east_emissions_2020-06-11.2015.zip
# rm pacific_emissions_2020-06-11.2015.zip
# cd ..

# cd data/csv
# unzip 2016_MEIT_Emissions.zip
# cd ../..
# node process/index.js data/csv/2016_MEIT_Emissions/2016_arctic_emissions_2020-06-13.csv data/csv/2016_MEIT_Emissions/arctic_emissions_2020-06-13.2016.csv --max-old-space-size=4000
# node process/index.js data/csv/2016_MEIT_Emissions/2016_east_emissions_2020-06-15.csv data/csv/2016_MEIT_Emissions/east_emissions_2020-06-15.2016.csv --max-old-space-size=4000
# node process/index.js data/csv/2016_MEIT_Emissions/2016_pacific_emissions_2020-06-13.csv data/csv/2016_MEIT_Emissions/pacific_emissions_2020-06-13.2016.csv --max-old-space-size=4000
# cd data/csv/2016_MEIT_Emissions
# zip arctic_emissions_2020-06-13.2016.zip arctic_emissions_2020-06-13.2016.csv
# zip east_emissions_2020-06-15.2016.zip east_emissions_2020-06-15.2016.csv
# zip pacific_emissions_2020-06-13.2016.zip pacific_emissions_2020-06-13.2016.csv
# az storage blob upload --container-name ecmeit --name arctic_emissions_2020-06-13.2016.zip --file arctic_emissions_2020-06-13.2016.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob upload --container-name ecmeit --name east_emissions_2020-06-15.2016.zip --file east_emissions_2020-06-15.2016.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# az storage blob upload --container-name ecmeit --name pacific_emissions_2020-06-13.2016.zip --file pacific_emissions_2020-06-13.2016.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# sleep 2
# rm arctic_emissions_2020-06-13.2016.zip
# rm east_emissions_2020-06-15.2016.zip
# rm pacific_emissions_2020-06-13.2016.zip
# cd ../../..

# cd data/csv
# unzip 2017_MEIT_Emissions.zip
# cd ../..
# node process/index.js data/csv/2017_MEIT_Emissions/2017_arctic_emissions_2020-06-15.csv data/csv/2017_MEIT_Emissions/arctic_emissions_2020-06-15.2017.csv --max-old-space-size=4000
# node process/index.js data/csv/2017_MEIT_Emissions/2017_east_emissions_2020-06-15.csv data/csv/2017_MEIT_Emissions/east_emissions_2020-06-15.2017.csv --max-old-space-size=4000
# node process/index.js data/csv/2017_MEIT_Emissions/2017_pacific_emissions_2020-06-15.csv data/csv/2017_MEIT_Emissions/pacific_emissions_2020-06-15.2017.csv --max-old-space-size=4000
# cd data/csv/2017_MEIT_Emissions
# zip arctic_emissions_2020-06-15.2017.zip arctic_emissions_2020-06-15.2017.csv
# zip east_emissions_2020-06-15.2017.zip east_emissions_2020-06-15.2017.csv
# zip pacific_emissions_2020-06-15.2017.zip pacific_emissions_2020-06-15.2017.csv
# cd ../../..

# cd data/csv
# unzip 2018_MEIT_Emissions.zip
# cd ../..
# node process/index.js data/csv/2018_MEIT_Emissions/2018_arctic_emissions_2020-06-16.csv data/csv/2018_MEIT_Emissions/arctic_emissions_2020-06-16.2018.csv --max-old-space-size=4000
# node process/index.js data/csv/2018_MEIT_Emissions/2018_east_emissions_2020-06-16.csv data/csv/2018_MEIT_Emissions/east_emissions_2020-06-16.2018.csv --max-old-space-size=4000
# node process/index.js data/csv/2018_MEIT_Emissions/2018_pacific_emissions_2020-06-16.csv data/csv/2018_MEIT_Emissions/pacific_emissions_2020-06-16.2018.csv --max-old-space-size=4000
# cd data/csv/2018_MEIT_Emissions
# zip arctic_emissions_2020-06-16.2018.zip arctic_emissions_2020-06-16.2018.csv
# zip east_emissions_2020-06-16.2018.zip east_emissions_2020-06-16.2018.csv
# zip pacific_emissions_2020-06-16.2018.zip pacific_emissions_2020-06-16.2018.csv
# cd ../../..


# sleep 2

# 2017

function run(){
    zipname=$1
    files=$2
    year=$3
    cd data/csv
    unzip $zipname.zip
    
    for file in $files
    do
    cd ../..
    node process/index.js data/csv/$zipname/$year"_"$file.csv data/csv/$zipname/$file.$year.csv --max-old-space-size=4000
    cd data/csv/$zipname
    zip $file.$year.zip $file.$year.csv
    az storage blob upload --container-name ecmeit --name $file.$year.zip --file $file.$year.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
    rm $file.$year.csv
    rm $file.$year.zip
    cd ..
    done
    
}

# run 2015_MEIT_Emissions "arctic_emissions_2020-06-11 east_emissions_2020-06-11 pacific_emissions_2020-06-11" 2015
# run 2016_MEIT_Emissions "arctic_emissions_2020-06-13 east_emissions_2020-06-15 pacific_emissions_2020-06-13" 2016
# run 2017_MEIT_Emissions "arctic_emissions_2020-06-15 east_emissions_2020-06-15 pacific_emissions_2020-06-15" 2017
# run 2018_MEIT_Emissions "arctic_emissions_2020-06-16 east_emissions_2020-06-16 pacific_emissions_2020-06-16" 2018
# cd ../..
# file=2019_arctic_emissions_2021-03-19.scrubber
# az storage blob download --container-name ecmeit --name $file.zip --file $file.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY




