'use strict'
const fs = require('fs-extra')
const parse = require('neat-csv')

function loadCSV (path) {
  return parse(fs.readFileSync(path))
}

// Average an array of values
// Expects: [{ 'year': 2019, 'value': 25 }, { 'year': 2019, 'value': 36 }]
// Returns: 30.5
function averageValues (values) {
  // Filter out nulls
  let filteredValues = values.filter(v => v.value)

  return filteredValues.reduce((a, b) => a + b.value, 0) / filteredValues.length
}

// Parses a value. Any number should be a number, an empty string is null,
// a hyphen is 0. Anything returns null
function parseValue (value) {
  let valNum = Number(value)
  if (value === '') return null
  if (typeof valNum === 'number' && !isNaN(valNum)) return valNum
  if (value.trim() === '-') return 0
  return null
}

// Order a array with objects by year
// Expects: [{ 'year': 2020, 'value': 25 }, { 'year': 2019, 'value': 36 }]
// Returns: [{ 'year': 2019, 'value': 36 }, { 'year': 2020, 'value': 25 }]
function orderByYear (data) {
  return data.sort((a, b) => a.year > b.year)
}

// Get latest value from an array of objects
// Expects: [{ 'year': 2015, 'value': 25 }, { 'year': 2019, 'value': 36 }]
// Returns: { 'year': 2019, 'value': 36 }
function getLatestValue (values) {
  return values
    .filter(i => i.value !== null) // ignore null values
    .reduce((a, b) => {
      if (b.year > a.year) return { year: b.year, value: b.value }
    }, { 'year': null, 'value': null })
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

// Filter result objects and omit redundant props
function cleanResults (data, category) {
  return data
    .filter(s => s.category === category)
    .map(s => {
      const { geography, category, ...o } = s
      return o
    })
}

function noDataWarning (type, geo) {
  console.log(`${type} - No data for ${geo}`)
}

module.exports = {
  averageValues: averageValues,
  cleanResults: cleanResults,
  getLatestValue: getLatestValue,
  getYears: getYears,
  loadCSV: loadCSV,
  noDataWarning: noDataWarning,
  orderByYear: orderByYear,
  parseValue: parseValue
}
