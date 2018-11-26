/* global step */
'use strict'
const assert = require('chai').assert
const fs = require('fs-extra')

const process = require('../scripts/process-data')
const utils = require('../scripts/utils')

// This test file performs tests on the input data, to make sure it's in the
// required format, and the pipeline runs without an issue.
describe('Input Data', function () {
  describe('Charts', async () => {
    const fp = './input/charts.csv'

    step('the definition file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    step('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'indicatorId', 'name', 'type', 'description', 'topic', 'labelX', 'labelY', 'unit', 'applicable-grid' ]
      const data = await utils.loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `${fp} doesn't have one of the required headers`)
    })

    step('valid chart types', async () => {
      const validChartTypes = ['answer', 'average', 'percent', 'range', 'timeSeries', 'absolute', 'group']
      const data = await utils.loadCSV(fp)

      return assert.isTrue(data.map(c => c.type).every(r => validChartTypes.includes(r)), `${fp} contains invalid chart types. Should be one of ${validChartTypes}`)
    })

    step('valid values for applicable-grid', async () => {
      const validValues = ['both', 'on', 'off']
      const data = await utils.loadCSV(fp)

      return assert.isTrue(data.map(c => c['applicable-grid']).every(r => validValues.includes(r)), `${fp} contains invalid values for column 'applicable-grid'. Should be one of ${validValues}`)
    })

    step('all groups reference valid chart IDs', async () => {
      const data = await utils.loadCSV(fp)

      // Generate a list of chart IDs (not of type group)
      const charts = data
        .filter(c => c.type !== 'group')
        .map(c => c.id)

      // An overview of the chart IDs being referenced in a group
      const groupedCharts = data
        .filter(c => c.type === 'group')
        .map(g => g['indicatorId'].split('|'))
        .reduce((a, b) => a.concat(b))

      // Check if any of the charts referenced by a group, is missing from the
      // chart definition.
      const missingCharts = groupedCharts
        .reduce((acc, b) => {
          if (charts.includes(b)) return acc
          return acc.concat(b)
        }, [])

      return assert.isEmpty(missingCharts, `The chart id's ${missingCharts} are referenced by a group, but not present in ${fp}.`)
    })
  })

  describe('Chart values', async () => {
    const fp = './input/chart-values.csv'

    step('the definition file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    step('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'indicator', 'label' ]
      const data = await utils.loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `${fp} doesn't have one of the required headers`)
    })

    step(`all charts of type 'answer', have at least one option in the chart values definition`, async () => {
      const charts = await utils.loadCSV('./input/charts.csv')
      const chartValues = await utils.loadCSV(fp)

      // Construct a list of indicator IDs referenced by charts.csv
      let chartIndicators = charts
        .filter(c => c.type === 'answer')
        .map(c => c.indicatorId)

      // Construct a list of indicator IDs referenced in the chart-values.csv
      let chartValuesIndicators = chartValues
        .reduce((acc, b) => acc.includes(b.indicator) ? acc : acc.concat(b.indicator), [])

      let missingIndicators = chartIndicators
        .reduce((acc, b) => chartValuesIndicators.includes(b) ? acc : acc.concat(b), [])

      return assert.isEmpty(missingIndicators, `The indicators ${missingIndicators} are used in a chart of type 'answer', but contain no values in ${fp}.`)
    })

    step(`all the values of an 'answer' chart are defined in the chart definition`, async () => {
      const charts = await utils.loadCSV('./input/charts.csv')
      const chartValues = await utils.loadCSV(fp)
      const rawIndicators = await utils.loadCSV('./input/subindicators.csv')
      const subindicators = process.subindicators(rawIndicators)

      // Construct a list of answer charts
      const answerCharts = charts
        .filter(c => c.type === 'answer')
        .map(c => c.indicatorId)

      let missingDefinitions = answerCharts
        .reduce((acc, c) => {
          // Construct array with unique values found in subindicators.csv.
          // It gets the value for the latest year.
          const uniqueValues = subindicators
            .filter(i => i.subindicator === c)
            .map(i => utils.getLatestValue(i.values).value)
            .reduce((acc, b) => {
              let cleanValue = utils.parseValue(b)
              return acc.includes(cleanValue) || cleanValue === null ? acc : acc.concat(cleanValue)
            }, [])

          // List with unique values in the chart definition
          const cValues = chartValues
            .filter(v => v.indicator === c)
            .map(v => utils.parseValue(v.id))

          // Compare both lists and check if there are missing values
          const missingValues = uniqueValues
            .reduce((acc, b) => cValues.includes(b) ? acc : acc.concat(b), [])

          return !missingValues.length
            ? acc
            : acc.concat({
              'subindicator': c,
              'values': missingValues
            })
        }, [])

      const missingDefString = missingDefinitions
        .map(def => `${def.subindicator}: ${JSON.stringify(def.values)}`)
        .join(', ')

      return assert.isEmpty(missingDefinitions, `Subindicator values for the following charts are not defined in ${fp}. ${missingDefString}.`)
    })
  })

  describe('Sub-indicators', async () => {
    const fp = './input/subindicators.csv'

    step('the subindicator file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    step('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'topic', 'category', 'indicator', 'subindicator', 'units', 'geography', 'note' ]
      const data = await utils.loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `The subindicator file doesn't have one of the required headers`)
    })
  })
})
