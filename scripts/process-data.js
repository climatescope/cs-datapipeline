'use strict'
const utils = require('./utils')

// Process chart data and turn empty string in null
function processRawCharts (charts) {
  return charts.map(c => utils.emptyStringsNull(c))
}

// Process raw geographies and add region meta-data to each of them
function processRawGeographies (geographies, regions) {
  return geographies.map(geo => {
    let region = regions.find(r => r.id === geo.region)
    if (!['developing market', 'developed market'].includes(geo.market_grouping.trim())) {
      utils.noDataWarning('market_grouping', geo.name)
    }
    const market = (geo.market_grouping || '').replace('market', '').trim()

    return {
      iso: geo.id.toLowerCase(),
      name: geo.name,
      grid: geo.grid,
      market,
      region: {
        id: region.id,
        name: region.name
      }
    }
  })
}

// Process raw investment data
// Aggregate values by year, sector and geography
function processRawInvestments (data, config) {
  const c = config.investments

  // The data contains data for funky years. Filter those out.
  // Exclude future years as well
  const cleanedData = data
    .filter(d => Number(d.year) > c.minYear && Number(d.year) <= c.maxYear)

  // Get the years with investment data across the dataset.
  // Not all countries have investments in all years.
  const years = [...cleanedData]
    .map(d => Number(d.year))
    .reduce((acc, b) => !acc.includes(b) ? acc.concat(b) : acc, [])
    .sort()

  return [...cleanedData]
    .reduce((acc, b) => {
      const year = Number(b.year)
      // Handle values like "1,244.54"
      const value = Number(b.value.replace(',', ''))
      const v = { year, value }

      let match = acc.find(o => o.geography === b.geography)
      if (!match) {
        return acc.concat({
          id: 'investment',
          subindicator: 'Investment',
          geography: b.geography,
          values: [v]
        })
      } else {
        // The input data can contain multiple investments for the same year,
        // sector, geography. Aggregate these.
        let yrMatch = match.values.find(v => v.year === year)

        if (yrMatch) {
          yrMatch.value += value
        } else {
          match.values = match.values.concat(v)
        }
        return acc
      }
    }, [])
    .map(geo => ({ ...geo, values: utils.fillMissingValues(geo.values, years) }))
}

// Process the annual scores. Add an indication of the year to each
// object in the array, and cast rank score to number
function processRawScores (scores, yr) {
  return scores.map(d => {
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

// Process sub-indicator data
function processRawSubindicators (data, config) {
  const c = config.subindicators
  const years = utils.getYears(data[0])

  return data.map(d => {
    let values = years
      // Exclude future years
      .filter(y => y <= c.maxYear)
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

// Process topics
function processRawTopics (topics) {
  return topics.map(t => ({ ...t, weight: Number(t.weight) }))
}

module.exports = {
  charts: processRawCharts,
  geographies: processRawGeographies,
  investments: processRawInvestments,
  scores: processRawScores,
  subindicators: processRawSubindicators,
  topics: processRawTopics
}
