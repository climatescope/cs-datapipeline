'use strict'
const bbox = require('@turf/bbox').default
const fs = require('fs-extra')
const parse = require('neat-csv')

function loadCSV (path) {
  return parse(fs.readFileSync(path))
}

// Load topics
async function loadTopics () {
  const topics = await loadCSV('./input/topics.csv')
  return topics.map(t => ({ ...t, weight: Number(t.weight) }))
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

// Parse an object and extract years from its keys
// Returns array of years, in ascending order
function getYears (o) {
  return Object.keys(o).reduce((acc, b) => {
    if (Number(b) > 2000 && Number(b) < 2100) return acc.concat(b)
    return acc
  }, [])
    .sort()
}

// Load CSV with sub-indicator data
async function loadSubIndicatorData (yr) {
  let data = await loadCSV(`./input/${yr}/subindicators.csv`)
  const years = getYears(data[0])

  return data.map(d => ({
    id: d.id,
    indicator: d.indicator,
    subindicator: d.subindicator,
    geography: d.geography,
    units: d.units,
    note: d.note,
    values: years.map(y => ({
      value: Number(d[y]),
      year: Number(y)
    }))
  }))
}

// Load CSV with investment data
// Aggregate values by year, sector and geography
async function loadInvestmentData (yr) {
  let data = await loadCSV(`./input/${yr}/investment.csv`)
  return data
    .filter(d => Number(d.year) > 2000 && Number(d.year) < 2100)
    .reduce((acc, b) => {
      let v = {
        year: Number(b.year),
        value: Number(b.value)
      }

      let match = acc.find(o => o.geography === b.geography && o.sector === b.sector)

      if (!match) {
        return acc.concat({
          id: 'investment',
          geography: b.geography,
          sector: b.sector,
          values: [v]
        })
      } else {
        // The input data can contains multiple investments for the same year,
        // sector, geography. Aggregate these.
        let yrMatch = match.values.find(v => v.year === Number(b.year))

        if (yrMatch) yrMatch.value += Number(b.value)
        else match.values = match.values.concat(v)

        return acc
      }
    }, [])
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

// Generate detailed result data
// It augments the data generated by generateResultData with the auxiliary
// data needed for the chart
function generateDetailedResultData (resultData, indicators, charts) {
  return resultData.map(geo => {
    let timeSeriesCharts = charts
      .filter(c => c.type === 'timeSeries')
      .map(c => generateTimeSeries(geo, indicators, c))

    return {
      ...geo,
      charts: [].concat(timeSeriesCharts)
    }
  })
}

// Generate data for a time-series chart for a single country
function generateTimeSeries (geo, data, chart) {
  return {
    'id': chart.id,
    'meta': {
      'label-x': chart.labelX,
      'label-y': chart.labelY,
      'title': chart.name
    },
    'data': data
      .filter(i => i.id === chart.indicatorId && i.geography === geo.name)
      .map(i => ({
        name: i.subindicator,
        values: i.values
      }))
  }
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

    const topics = await loadTopics()
    const charts = await loadCSV('./input/2018/definitions/charts.csv')

    const geographies = await loadGeographies()

    // TODO Handle multiple years
    const scores = await loadScoreData(2018)

    // No need to load multiple years, only the most recent
    const indicators = [].concat(await loadSubIndicatorData(2018), await loadInvestmentData(2018))

    // Contains overall and topic scores
    const resultData = generateResultData(geographies, scores, topics)

    // Contains scores, and the auxiliary data to build the charts
    const detailedResultData = generateDetailedResultData(resultData, indicators, charts)

    const geographyData = await generateGeographyData(geographies)

    // await Promise.map()
    await fs.writeJson('./output/geographies.json', geographyData)
    await fs.writeJson('./output/results.json', resultData)
    await Promise.all(detailedResultData.map(geo => fs.writeJson(`./output/results/${geo.iso}.json`, geo)))
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}())
