'use strict'
const bbox = require('@turf/bbox').default
const fs = require('fs-extra')
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

// Load CSV data with annual scores. Add an indication of the year to each
// object in the array, and cast rank score to number
async function loadScoreData (yr) {
  let data = await loadCSV(`./input/${yr}/scores.csv`)
  return data.map(d => {
    // No need to keep score around
    const { score, ...newD } = d

    return {
      ...newD,
      rank: Number(d.rank),
      value: Number(d.score),
      year: yr
    }
  })
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
      let scoreData = { data: cleanResults(geoScores, 'overall') }
      let topicData = topics.map(t => ({ ...t, data: cleanResults(geoScores, t.id) }))
      return { ...geo, score: scoreData, topics: topicData }
    } else {
      console.log(`Couldn't find scores for ${geo.name}`)
      return { ...geo }
    }
  })
}

// Generate overview of geographies. Add a bbox
async function generateGeographyData (geographies) {
  const admin = await fs.readJson('./input/lib/ne-110m_bbox.geojson')

  return geographies.map(geo => {
    const ft = admin.features.find(c => c.properties.ISO_A2.toLowerCase() === geo.iso)
    const b = ft ? bbox(ft) : null

    return { ...geo, bbox: b }
  })
}

(async function main () {
  try {
    // Empty the output folder. Create them if they don't exist.
    await ['./output', './output/results'].forEach(f => fs.emptyDirSync(f))

    const geographies = await loadGeographies()
    const topics = await loadCSV('./input/topics.csv')

    // TODO Handle multiple years
    const scores = await loadScoreData(2018)
    // const indicators = await loadAnnualData('indicators', 2018)

    const resultData = generateResultData(geographies, scores, topics)
    const geographyData = await generateGeographyData(geographies)

    // await Promise.map()
    await fs.writeJson('./output/geographies.json', geographyData)
    await fs.writeJson('./output/results.json', resultData)
    await Promise.all(resultData.map(geo => fs.writeJson(`./output/results/${geo.iso}.json`, geo)))
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}())
