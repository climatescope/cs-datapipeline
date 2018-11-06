'use strict'
const fs = require('fs-extra')

const load = require('./scripts/load-data')
const generate = require('./scripts/generate-data')
const utils = require('./scripts/utils');

(async function main () {
  try {
    // Empty the output folder. Create them if they don't exist.
    await ['./output', './output/results'].forEach(f => fs.emptyDirSync(f))

    const topics = await load.topics()
    const charts = await utils.loadCSV('./input/charts.csv')
    const answers = await utils.loadCSV('./input/answers.csv')

    const geographies = await load.geographies()

    // TODO Handle multiple years
    const scores = await load.scoreData(2018)

    // No need to load multiple years, only the most recent
    const indicators = [].concat(await load.subIndicatorData(2018), await load.investmentData(2018))

    // Contains overall and topic scores
    const resultData = generate.results(geographies, scores, topics)

    // Contains scores, and the auxiliary data to build the charts
    const detailedResultData = generate.detailedResults(resultData, indicators, charts)

    const chartMeta = generate.chartMeta(charts, answers)
    const geographyData = await generate.geographies(geographies)

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
