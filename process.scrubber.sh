node process/index.js data/csv/sample_pacific_with_scrubber_emissions_2018.csv data/csv/sample_pacific_with_scrubber_emissions_2018.2.csv true --max-old-space-size=4000

# node upload/data2db.scrubber.js 2018  --max-old-space-size=3800
#node upload/data2db.scrubber.js 0 2018
node upload/data2db.scrubber.js 1 2018 sample_pacific_with_scrubber_emissions_2018.2.csv  --max-old-space-size=4000