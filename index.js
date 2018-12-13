'use strict'
const fs = require('fs-extra')
const yaml = require('js-yaml')

const process = require('./scripts/process-data')
const generate = require('./scripts/generate-data')
const utils = require('./scripts/utils');

(async function main () {
  try {
    // Empty the output folders. Create them if they don't exist.
    await ['./output', './output/results'].forEach(f => fs.emptyDirSync(f))

    const config = yaml.safeLoad(await fs.readFile('./input/config.yml'))

    // Load the raw data from CSV files
    const [
      rawCharts,
      rawChartValues,
      rawGeographies,
      rawInvestments,
      rawRegions,
      rawScores,
      rawSubindicators,
      rawTopics
    ] = await Promise.all([
      utils.loadCSV('./input/charts.csv'),
      utils.loadCSV('./input/chart-values.csv'),
      utils.loadCSV('./input/geographies.csv'),
      utils.loadCSV(`./input/investments.csv`),
      utils.loadCSV('./input/regions.csv'),
      utils.loadCSV(`./input/2018/scores.csv`),
      utils.loadCSV(`./input/subindicators.csv`),
      utils.loadCSV('./input/topics.csv')
    ])

    // Process the raw data into something more useful
    const [
      charts,
      geographies,
      indicators,
      scores,
      topics
    ] = await Promise.all([
      process.charts(rawCharts),
      process.geographies(rawGeographies, rawRegions),
      [].concat(await process.subindicators(rawSubindicators, config), await process.investments(rawInvestments, config)),
      process.scores(rawScores, 2018),
      process.topics(rawTopics)
    ])

    // Contains overall and topic scores
    const [
      chartMeta,
      geographyData,
      resultData
    ] = await Promise.all([
      generate.chartMeta(charts, rawChartValues),
      generate.geographies(geographies),
      generate.results(geographies, scores, topics)
    ])

    // Contains scores, and the auxiliary data to build the charts
    const detailedResultData = generate.detailedResults(resultData, indicators, charts, config)

    await Promise.all([
      ...detailedResultData.map(geo => fs.writeJson(`./output/results/${geo.iso}.json`, geo)),
      fs.writeJson('./output/geographies.json', geographyData),
      fs.writeJson('./output/chart-meta.json', chartMeta),
      fs.writeJson('./output/results.json', resultData)
    ])
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}())
