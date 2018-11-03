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
id,topic,category,indicator,subindicator,units,geography,2010,2011,2012,...,note
3.05,Experience,System,Biomass & Waste,MW,Burkina Faso,9,12,13,...
```

It will try to get data for years between 2000 and 2100. It assumes the values to be numeric.

### Investment
`investment.csv` - Data for the Clean Energy Investment chart. The script aggregates data by year, sector and geography. It requires the following columns:

``` csv
year,sector,geography,value
2017,Wind,Albania,36.1

```

If the dataset contains multiple entries for the same year, sector and geography, it will aggregate these into a single annual value. Only years between 2000 and 2100 are considered.

Additional columns in the dataset are ignored.

### Charts
`/[year]/definitions/charts.csv` - An overview of the charts that will be generated for this edition

- `id` - a unique ID for the chart. This can only contain letters. Eg. `concentrationGeneration`
- `type` - type of chart. One of: `singleAnswer`, `timeSeries `
- `indicatorId` - the ID of the corresponding indicator in the CSV file with subindicator and investment data. This should match the ID completely, otherwise it won't be able to fetch the data. Eg. `3.05` or `Curtailment risk`
- `labelX` - optional, use when the chart type is `timeSeries`. Eg .`year`
- `labelY` - optional, use when the chart type is `timeSeries`. Eg. `Gwh`
- `name` - the title of the chart, used in the interface. Eg. `Concentration of generation market`
- `description` - the description of the chart, used in the interface. Eg. `Is the generation market concentrated?`

#### singleAnswer
Single answer charts are indicators with a single answer (yes / no, high / low). When there are multiple data points for a country, the script will store the value for the latest year.

#### timeSeries
These are used to generate charts that show the evolution over time. The script will parse data for all the years between 2000 and 2100.
