'use strict'
const assert = require('chai').assert
const fs = require('fs-extra')
const parse = require('neat-csv')

function loadCSV (path) {
  return parse(fs.readFileSync(path))
}

describe('Input Data', function () {
  describe('Charts', async () => {
    const fp = './input/definitions/charts.csv'

    it('the definition file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    it('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'indicatorId', 'name', 'type', 'description', 'labelX', 'labelY' ]
      const data = await loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `The chart definition doesn't require one of the required headers`)
    })

    it('valid chart types', async () => {
      const validChartTypes = ['answer', 'timeSeries', 'absolute', 'group']
      const data = await loadCSV(fp)

      return assert.isTrue(data.map(c => c.type).every(r => validChartTypes.includes(r)), `The chart definition contains invalid chart types. Should be one of ${validChartTypes}`)
    })
  })

  describe('Answers', async () => {
    const fp = './input/definitions/answers.csv'

    it('the definition file exists', async () =>
      assert.isTrue(await fs.pathExists(fp), `${fp} does not exist`)
    )

    it('has all the required headers', async () => {
      const requiredHeaders = [ 'id', 'indicator', 'label' ]
      const data = await loadCSV(fp)

      return assert.containsAllKeys(data[0], requiredHeaders, `The answer definition doesn't require one of the required headers`)
    })
  })
})
