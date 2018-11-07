'use strict'
const utils = require('./utils')

// Load topics
async function loadTopics () {
  const topics = await utils.loadCSV('./input/topics.csv')
  return topics.map(t => ({ ...t, weight: Number(t.weight) }))
}

// Load geographies and add region meta-data to each of them
async function loadGeographies () {
  const geographies = await utils.loadCSV('./input/geographies.csv')
  const regions = await utils.loadCSV('./input/regions.csv')

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
  let data = await utils.loadCSV(`./input/${yr}/scores.csv`)
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

// Load CSV with sub-indicator data
async function loadSubIndicatorData (yr) {
  let data = await utils.loadCSV(`./input/${yr}/subindicators.csv`)
  const years = utils.getYears(data[0])

  return data.map(d => {
    let values = years
      .map(y => ({
        value: utils.parseValue(d[y]),
        year: Number(y)
      }))

    return {
      id: d.id,
      category: d.category,
      indicator: d.indicator,
      subindicator: d.subindicator,
      geography: d.geography,
      units: d.units,
      note: d.note,
      values: utils.orderByYear(values)
    }
  })
}

// Load CSV with investment data
// Aggregate values by year, sector and geography
async function loadInvestmentData (yr) {
  let data = await utils.loadCSV(`./input/${yr}/investment.csv`)
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

        if (yrMatch) {
          yrMatch.value += Number(b.value)
        } else {
          match.values = match.values.concat(v)
        }

        return acc
      }
    }, [])
}

module.exports = {
  geographies: loadGeographies,
  investmentData: loadInvestmentData,
  scoreData: loadScoreData,
  subIndicatorData: loadSubIndicatorData,
  topics: loadTopics
}
