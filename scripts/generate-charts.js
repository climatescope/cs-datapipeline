'use strict'
const utils = require('./utils')

// Generate data for a time-series chart for a single country
function generateTimeSeriesChart (geo, data, chart) {
  let chartData = data
    .filter(i => i.id === chart.indicatorId && i.geography === geo.name)
    .map(i => ({
      name: i.subindicator,
      values: utils.orderByYear(i.values)
    }))

  if (!chartData.length) utils.noDataWarning(chart.name, geo.name)

  return {
    'id': chart.id,
    'meta': {
      'label-x': chart.labelX,
      'label-y': chart.labelY,
      'title': chart.name
    },
    'data': chartData
  }
}

// Generate data for a single answer chart, for a specific year
function generateSingleValueChart (geo, data, chart, yr) {
  let indicatorData = data
    .find(i => i.subindicator === chart.indicatorId && i.geography === geo.name)

  let answer = { 'id': chart.id, 'value': null, 'year': null, 'note': null }

  if (!indicatorData) {
    utils.noDataWarning(chart.name, geo.name)
    return answer
  }

  // Get the value for a specific year
  let yrValue = indicatorData.values.find(v => v.year === yr)

  let value = chart.type === 'percent' ? yrValue.value * 100 : yrValue.value
  // Keep 2 decimals
  value = value ? Math.round(value * 1e2) / 1e2 : value

  return {
    ...answer,
    'value': value,
    'year': yr,
    'note': indicatorData.note === '' ? null : indicatorData.note
  }
}

// Generate an average for multiple indicators, for a specific year
function generateAverageValue (geo, data, chart, yr) {
  let indicatorsToAvg = chart['indicatorId'].split('|')
  let indicatorData = data
    .filter(d => d.geography === geo.name && indicatorsToAvg.includes(d.subindicator))

  let value = { 'id': chart.id, 'value': null, 'year': null, 'note': null }

  if (!indicatorData) {
    utils.noDataWarning(chart.name, geo.name)
    return value
  }

  // Get the latest years we have a value for, for each indicator, and filter
  // out the nulls.
  let yrValues = indicatorData
    .map(ind => ind.values.find(v => v.year === yr))
    .filter(ind => ind.value)

  if (!yrValues.length) {
    utils.noDataWarning(chart.name, geo.name)
    return value
  }

  return {
    ...value,
    value: utils.averageValues(yrValues),
    year: yr
  }
}

// Group particular objects within an array of chart data
function groupCharts (chartData, groups) {
  let groupData = groups.map(g => {
    // indicatorId is a string, referencing chart IDs to be grouped, separated
    // by a '|'
    let chartsToGroup = g['indicatorId'].split('|')

    let groupData = chartsToGroup
      .map(groupInd => chartData.find(c => c.id === groupInd))

    return {
      'id': g.id,
      'description': g.description,
      'data': groupData
    }
  })

  // Remove the original charts that were added to a group
  let groupedCharts = groups
    .map(g => g['indicatorId'].split('|'))
    .reduce((a, b) => a.concat(b))

  return chartData
    .concat(groupData)
    .filter(c => groupedCharts.indexOf(c.id) === -1)
}

module.exports = {
  groupCharts: groupCharts,
  averageValue: generateAverageValue,
  singleValue: generateSingleValueChart,
  timeSeries: generateTimeSeriesChart
}
