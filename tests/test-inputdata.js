'use strict'
const assert = require('chai').assert
const fs = require('fs-extra')
const parse = require('neat-csv')

function loadCSV (path) {
  return parse(fs.readFileSync(path))
}

describe('Input Data', function () {
  describe('Charts', async () => {
    const fp = './input/charts.csv'

    // eslint-disable-next-line
    step('the definition file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    // eslint-disable-next-line
    step('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'indicatorId', 'name', 'type', 'description', 'labelX', 'labelY' ]
      const data = await loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `The chart definition doesn't require one of the required headers`)
    })

    // eslint-disable-next-line
    step('valid chart types', async () => {
      const validChartTypes = ['answer', 'timeSeries', 'absolute', 'group']
      const data = await loadCSV(fp)

      return assert.isTrue(data.map(c => c.type).every(r => validChartTypes.includes(r)), `The chart definition contains invalid chart types. Should be one of ${validChartTypes}`)
    })

    // eslint-disable-next-line
    step('all groups reference valid chart IDs', async () => {
      const data = await loadCSV(fp)

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

      return assert.isEmpty(missingCharts, `The chart id's ${missingCharts} are referenced by a group, but not present in the definition file.`)
    })
  })

  describe('Answers', async () => {
    const fp = './input/answers.csv'

    // eslint-disable-next-line
    step('the definition file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    // eslint-disable-next-line
    step('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'indicator', 'label' ]
      const data = await loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `The answer definition doesn't require one of the required headers`)
    })

    // eslint-disable-next-line
    step(`all charts of type 'answer', have at least one option in the answer definition`, async () => {
      const answers = await loadCSV(fp)
      const charts = await loadCSV('./input/charts.csv')

      // Construct a list of indicator IDs referenced by charts
      let chartIndicators = charts
        .filter(c => c.type === 'answer')
        .map(c => c.indicatorId)

      // Construct a list of indicator IDs referenced by answers
      let answerIndicators = answers
        .reduce((acc, b) => {
          if (acc.includes(b.indicator)) return acc
          return acc.concat(b.indicator)
        }, [])

      let missingAnswers = chartIndicators
        .reduce((acc, b) => {
          if (answerIndicators.includes(b)) return acc
          return acc.concat(b)
        }, [])

      return assert.isEmpty(missingAnswers, `The indicators ${missingAnswers} are used in a chart of type 'answer', but contain no answer in the definition file.`)
    })
  })
})
