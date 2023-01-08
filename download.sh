
function run(){
    
    year=$1
    folders=$2
    
    node upload/data2db.js 0 $year 1
    
    # for folder in $folders
    # do
    # files=$(az storage blob list -c ecmeit --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY --prefix $folder"/" | jq '. [] .name')     
    # for file in $files
    # do
    # if [[ $file =~ "_$year"_"" ]]; then
    # #   echo $year $file
    #     ffile=${file//\"/}
    #     mkdir -p $MEIT_CSV"/"$folder
    #     lfile=$MEIT_CSV"/"$ffile
    #     az storage blob download --container-name ecmeit --name $ffile --file $lfile --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
    #     node upload/data2db.js 1 $year $lfile
    # fi
    # done
    # done
    
}
# run 2015 "MEIT_Arctic MEIT_Pacific MEIT_East"
run 2016 "MEIT_Arctic MEIT_Pacific MEIT_East"
# run 2017 "MEIT_Arctic MEIT_Pacific MEIT_East"
# run 2018 "MEIT_Arctic MEIT_Pacific MEIT_East"
# run 2019 "MEIT_Arctic MEIT_Pacific MEIT_East"
# run 2020 "MEIT_Arctic MEIT_Pacific MEIT_East"
