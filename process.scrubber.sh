# node process/index.js data/csv/sample_pacific_with_scrubber_emissions_2018.csv data/csv/sample_pacific_with_scrubber_emissions_2018.2.csv true --max-old-space-size=4000
# node process/index.js data/csv/2019_arctic_emissions_2021-03-19.csv data/csv/2019_arctic_emissions_2021-03-19.2.csv true --max-old-space-size=4000

# node upload/data2db.scrubber.js 2018  --max-old-space-size=3800
#node upload/data2db.scrubber.js 0 2018


# node process/index.js data/csv/2019_arctic_emissions_2021-03-19.csv data/csv/2019_arctic_emissions_2021-03-19.scrubber.csv true --max-old-space-size=4000
# node upload/data2db.scrubber.js 0 2019
# node upload/data2db.scrubber.js 1 2019 2019_arctic_emissions_2021-03-19.scrubber.csv  --max-old-space-size=4000


# node process/index.js data/csv/2019_pacific_emissions_2021-03-19.csv data/csv/2019_pacific_emissions_2021-03-19.scrubber.csv true --max-old-space-size=4000
# node process/index.js data/csv/2019_east_emissions_2021-03-19.csv data/csv/2019_east_emissions_2021-03-19.scrubber.csv true --max-old-space-size=4000

# node upload/data2db.scrubber.js 0 2019
# node upload/data2db.scrubber.js 1 2019 2019_pacific_emissions_2021-03-19.scrubber.csv  --max-old-space-size=4000

# cd data/csv
# file=2019_arctic_emissions_2021-03-19.scrubber
# zip $file.zip $file.csv
# az storage blob upload --container-name ecmeit --name $file.zip --file $file.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# rm $file.zip
# rm $file.csv

# file=2019_pacific_emissions_2021-03-19.scrubber
# zip $file.zip $file.csv
# az storage blob upload --container-name ecmeit --name $file.zip --file $file.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# rm $file.zip
# rm $file.csv

# file=2019_east_emissions_2021-03-19.scrubber
# zip $file.zip $file.csv
# az storage blob upload --container-name ecmeit --name $file.zip --file $file.zip --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
# rm $file.zip
# rm $file.csv


node upload/data2db.scrubber.js 0 2019
node upload/data2db.scrubber.js 1 2019 2019_arctic_emissions_2021-03-19.scrubber.zip  --max-old-space-size=4000
node upload/data2db.scrubber.js 1 2019 2019_pacific_emissions_2021-03-19.scrubber.zip  --max-old-space-size=4000
node upload/data2db.scrubber.js 1 2019 2019_east_emissions_2021-03-19.scrubber.zip  --max-old-space-size=4000
