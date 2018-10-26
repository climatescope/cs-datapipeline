# Climatescope Data Pipeline
The pipeline that prepares data for use on the global-climatescope.org.

Install the dependencies:

`yarn install`

Run the pipeline:

`node index.js`

## Pipeline notes
Loose notes to be organized:

- The pipeline will generate data for the geographies and topics that are in: `./input/geographies.csv` and `./input/topics.csv`. If a geography is included in `scores.csv`, but not in the `geographies.csv` it will not be picked up.

### Sub-indicators
`/[year]/subindicators.csv` - Data with subindicator data. This expects the following columns: 

``` csv
id,topic,category,indicator,subindicator,units,geography,2010,2011,2012,...
3.05,Experience,System,Biomass & Waste,MW,Burkina Faso,9,12,13,...
```

It will try to get data for years between 2000 and 2100. It assumes the values to be numeric.