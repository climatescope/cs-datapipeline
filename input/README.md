# Climatescope Input data
The `input` folder contains a series of CSV files to prepare the data for the global-climatescope.org. This readme outlines the requirements of each of the files:

- [chart values](#chart-valuescsv)
- [charts](#chartscsv)
- [geographies](#geographiescsv)
- [investments](#investmentscsv)
- [regions](#regionscsv)
- [subindicators](#subindicatorscsv)
- [topics](#topicscsv)

## chart-values.csv
An overview of the values and labels of chart type `answer` and `range`. This file will be used to translate the ID in the subindicator file into a human readable label on the frontend.

Requires the following columns:

- `indicator` - the ID of the indicator. Should be the same as the ID in the file with subindicator data.
- `id` - the ID of the value. Should be the same as the ID in the file with subindicators.
- `label` - the label of the value, to be presented to the user in the interface.

Example:

```
indicator,id,label
Utility privatisation,0,No
Utility privatisation,0.5,Somewhat
Availability of Finance,0,Low
Availability of Finance,2.5,High
```

The `range` and `answer` types require labels to be specified for every chart.

## charts.csv
An overview of the charts that will be generated for this edition.

- `id` - a unique ID for the chart. This can only contain letters. Eg. `concentrationGeneration`
- `type` - type of chart. One of: `absolute`, `answer`, `timeSeries`, and `group`
- `name` - the title of the chart, used in the interface. Eg. `Concentration of generation market`
- `description` - the description of the chart, used in the interface. Eg. `Is the generation market concentrated?`
- `topic` - the ID of the topic the chart belongs to. This topic should be in `topics.csv`. Eg. `fundamentals`.
- `indicatorId` - the ID of the corresponding indicator in the CSV file with subindicator and investment data. This should match the ID completely, otherwise it won't be able to fetch the data. Some chart types allow multiple indicators to be specified. In these cases, they are split by a `|`. Eg. `Large VAT|SmallVAT` or `Curtailment risk`
- `labelX` - mandatory for chart type `timeSeries`. Eg .`year`
- `labelY` - mandatory for chart type `timeSeries`. Eg. `Gwh`
- `unit` - mandatory for chart type `absolute`. Eg. `%`

[See below for more information](#chart-types) about each of the chart types.

## geographies.csv
This file determines which countries the pipeline will produce results for. If a geography is included in `scores.csv`, but not in the `geographies.csv` it will not be picked up.

Structure:

- `id` - the [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code of the country
- `name` - the name to be shown on the site. Note that this name needs to be exactly the same as used in the other files. (including `subindicators.csv` and `scores.csv`)
- `grid` - the grid status of the country. One of: `on`, `off`
- `region` - the ID of the region. Needs to be specified in [`regions.csv`](#regionscsv)

## investments.csv
Data on clean energy investments. The script aggregates data by year, sector and geography.

Structure:

- `year` - the year of the investment. Eg. `2014`
- `sector` - the sector of the investment. Eg. `Wind`
- `geography` - the geography of the investment. Note that this needs to be spelled the same as the name in [`geographies.csv`](#geographiescsv). Eg. `Albania`
- `value` - the value of the investment

If the dataset contains multiple entries for the same year, sector and geography, it will aggregate these into a single annual value. Only years between 2000 and 2100 are considered.

Additional columns in the dataset are ignored.

## regions.csv
This file contains the regions.

Structure:

- `id` - the ID of the region. This should correspond to the region ID's used in [`geographies.csv`](#geographiescsv)
- `name` - the human readable name used on the website

## subindicators.csv
Data with subindicator data. This expects the following columns: 

``` csv
id,topic,category,indicator,subindicator,units,geography,2010,2011,2012,...,note
3.05,Experience,System,Biomass & Waste,MW,Burkina Faso,9,12,13,...
```

It will try to get data for years between 2000 and 2100.

## topics.csv
Data about the topics.

Structure:

- `id` - ID of the topic. Eg. `opportunities`
- `name` - name of the topic. Eg. `Opportunities`
- `weight` - numeric value with the weight. The total of all weights should sum to 1. Eg. `0.25`

---

## Chart types

### absolute
`absolute` charts refer to values that are not encoded, and thus don't rely on the answer definition. An example is Foreign Investment, which is stored in `subindicators.csv` as `Foreign Investment: 0.92`
These chart types need to have a unit.

### answer
`answer` charts are indicators with a single answer that is encoded in the subindicator file. An example is Utility Privatisation, which can be answered with yes / no / somewhat, but is stored in `subindicators.csv` as `Utility Privatisation: 1`.

When there are multiple data points for a country, the script will store the value for the latest year.

See the section [Chart Values](#chart-valuescsv) for more information about labeling the answers.

### average
`average` takes multiple sub-indicators and returns their average. These sub-indicators have to be specified in the `indicatorId` column, separated by a `|`.
For example: `Average residential electricity prices|Average commercial electricity prices`.

`null` values are not taken into account to calculate the average.

### percent
`percent` takes an absolute decimal value (`0.1`) and returns a percent value (10).

### range
`range` allows a value to be specified on a scale. An example is 'Availability of Finance', which can have values between `0` and `2.5`. In the [Chart Values](#chart-valuescsv) file, these range steps will need to be specified. The minimum is the lower and upper bound, but intermediate steps can be specified as well (like: low, medium, high):

``` json
"options": [
  {
    "id": 0,
    "label": "Low"
  },
  {
    "id": 2.5,
    "label": "High"
  }
]
```

This differs from the `answer` type, which expects every value to match a single answer.

### timeSeries
These are used to generate charts that show the evolution over time, for example Installed Capacity.

The script will parse data for all the years between 2000 and 2100, and has support for multiple trendlines.

### group
The `group` chart is a special type that groups together other charts. The group has a single title and description, and can be used to generate something along these lines:

![](https://user-images.githubusercontent.com/751330/48009523-e6dc5000-e0e9-11e8-8122-1aaf55defa57.png)

The above chart can be configured with the following structure:

| id | indicatorId | name | type | description |
| --- | --- | --- | --- | --- |
| averageVAT | largeVAT\|smallVAT | Average VAT paid by renewables | group | What is the average level of VAT for components needed to build a wind project?|
| largeVAT | VAT - Large scale renewables | Large scale renewables | absolute | |
| smallVAT | VAT - Small scale renewables | Small scale renewables | absolute | |

The field `indicatorId` has to reference other charts in the CSV, separated by a `|`.
The field `type` must be the same for all referenced indicators within the same group. (eg. `absolute`)
