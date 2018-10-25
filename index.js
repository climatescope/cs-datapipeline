'use strict'
const fs = require('fs')
const parse = require('neat-csv')

function loadCSV (path) {
  return parse(fs.readFileSync(path))
}

// Load geographies and add region meta-data to each of them
async function loadGeographies () {
  const geographies = await loadCSV('./input/geographies.csv')
  const regions = await loadCSV('./input/regions.csv')

  return geographies.map(geo => {
    let region = regions.find(r => r.id === geo.region)
    return {
      iso: geo.id.toLowerCase(),
      name: geo.name,
      grid: geo.grid,
      region: {
        id: region.id,
        name: region.name
      }
    }
  })
}

// Load CSV data and add an indication of the year to each object in the array
async function loadAnnualData (type, yr) {
  let data = await loadCSV(`./input/${yr}/${type}.csv`)
  return data.map(d => ({ ...d, year: yr }))
}

// Filter result objects and omit redundant props
function cleanResults (data, category) {
  return data
    .filter(s => s.category === category)
    .map(s => {
      const { geography, category, ...o } = s
      return o
    })
}

// Generate overall result data
// Returns an array with objects per geography, each with overall and topic
// scores
function generateResultData (geographies, scores, topics) {
  return geographies.map(geo => {
    let geoScores = scores.filter(s => s.geography === geo.name)

    if (geoScores.length) {
      geo['score'] = { data: cleanResults(geoScores, 'overall') }
      geo['topics'] = topics.map(t => ({ ...t, data: cleanResults(geoScores, t.id) }))
    } else {
      console.log(`Couldn't find scores for ${geo.name}`)
    }
    return geo
  })
}

(async function main () {
  try {
    const geographies = await loadGeographies()
    const topics = await loadCSV('./input/topics.csv')

    // TODO Handle multiple years
    const scores = await loadAnnualData('scores', 2018)
    // const indicators = await loadAnnualData('indicators', 2018)

    const results = generateResultData(geographies, scores, topics)

    // tStart(`Total run time`)()
    // console.log(scores[0])

    fs.writeFileSync('./output/results.json', JSON.stringify(results))
    results.forEach(geo => fs.writeFileSync(`./output/results/${geo.iso}.json`, JSON.stringify(geo)))

    // tEnd(`Total run time`)()
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}())
