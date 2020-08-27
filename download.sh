
function run(){
    
    year=$1
    files=$2
    
    node upload/data2db.js 0 $year files
    for file in $files
    do
    # az storage blob download --container-name ecmeit --name $file --file $MEIT_CSV"/"$file --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
    node upload/data2db.js 1 $year $file
    # rm $MEIT_CSV"/"$file
    done
    
}

# run 2015 "arctic_emissions_2020-06-11.2015.zip east_emissions_2020-06-11.2015.zip pacific_emissions_2020-06-11.2015.zip"
# run 2016 "arctic_emissions_2020-06-13.2016.zip east_emissions_2020-06-15.2016.zip pacific_emissions_2020-06-13.2016.zip"
# run 2017 "arctic_emissions_2020-06-15.2017.zip east_emissions_2020-06-15.2017.zip pacific_emissions_2020-06-15.2017.zip"
# run 2018 "arctic_emissions_2020-06-16.2018.zip east_emissions_2020-06-16.2018.zip pacific_emissions_2020-06-16.2018.zip"
