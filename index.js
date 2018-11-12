'use strict'
const fs = require('fs-extra')

const process = require('./scripts/process-data')
const generate = require('./scripts/generate-data')
const utils = require('./scripts/utils');

(async function main () {
  try {
    // Empty the output folder. Create them if they don't exist.
    await ['./output', './output/results'].forEach(f => fs.emptyDirSync(f))

    // Load the raw data from CSV files
    const [
      rawAnswers,
      rawCharts,
      rawGeographies,
      rawInvestments,
      rawRegions,
      rawScores,
      rawSubindicators,
      rawTopics
    ] = await Promise.all([
      utils.loadCSV('./input/answers.csv'),
      utils.loadCSV('./input/charts.csv'),
      utils.loadCSV('./input/geographies.csv'),
      utils.loadCSV(`./input/2018/investment.csv`),
      utils.loadCSV('./input/regions.csv'),
      utils.loadCSV(`./input/2018/scores.csv`),
      utils.loadCSV(`./input/2018/subindicators.csv`),
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
      [].concat(await process.subindicators(rawSubindicators), await process.investments(rawInvestments)),
      process.scores(rawScores, 2018),
      process.topics(rawTopics)
    ])

    // Contains overall and topic scores
    const [
      chartMeta,
      geographyData,
      resultData
    ] = await Promise.all([
      generate.chartMeta(charts, rawAnswers),
      generate.geographies(geographies),
      generate.results(geographies, scores, topics)
    ])

    // Contains scores, and the auxiliary data to build the charts
    const detailedResultData = generate.detailedResults(resultData, indicators, charts)

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
