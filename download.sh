function run() {
    year=$1

    # Assuming node command is needed before the loop
    node upload/data2db.js 0 $year 1

    
    zones=("arctic" "east" "pacific")
    for zone in "${zones[@]}"
    do
        name=${zone}_${year}.2.zip
        az storage blob download --container-name ecmeit --name UPLOAD2024/$name --file $MEIT_CSV/$name --account-name $AZURE_STORAGE_ACCOUNT --account-key $AZURE_STORAGE_ACCESS_KEY
        node upload/data2db.js 1 $year $name
        rm $MEIT_CSV/$name
    done
}

# run 2015
# run 2016
run 2017
run 2018
run 2019
run 2020

# az storage blob download --container-name ecmeit --name UPLOAD2024/arctic_2021.2.zip --file $MEIT_CSV/arctic_2021.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/east_2021.2.zip --file $MEIT_CSV/east_2021.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/pacific_2021.2.zip --file $MEIT_CSV/pacific_2021.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/arctic_2022.2.zip --file $MEIT_CSV/arctic_2022.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/east_2022.2.zip --file $MEIT_CSV/east_2022.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/pacific_2022.2.zip --file $MEIT_CSV/pacific_2022.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/arctic_2023.2.zip --file $MEIT_CSV/arctic_2023.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/east_2023.2.zip --file $MEIT_CSV/east_2023.2.zip
# az storage blob download --container-name ecmeit --name UPLOAD2024/pacific_2023.2.zip --file $MEIT_CSV/pacific_2023.2.zip
# node upload/data2db.js 0 2021 1
# node upload/data2db.js 0 2022 1
# node upload/data2db.js 0 2023 1
# node upload/data2db.js 1 2021 arctic_2021.2.zip
# node upload/data2db.js 1 2021 east_2021.2.zip
# node upload/data2db.js 1 2021 pacific_2021.2.zip
# node upload/data2db.js 1 2022 arctic_2022.2.zip
# node upload/data2db.js 1 2022 east_2022.2.zip
# node upload/data2db.js 1 2022 pacific_2022.2.zip
# node upload/data2db.js 1 2023 arctic_2023.2.zip
# node upload/data2db.js 1 2023 east_2023.2.zip
# node upload/data2db.js 1 2023 pacific_2023.2.zip

