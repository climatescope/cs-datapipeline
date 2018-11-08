'use strict'
const assert = require('chai').assert

const process = require('../scripts/process-data')

describe('Process Data', function () {
  describe('Investments', async () => {
    let input = [
      {
        year: '2006',
        geography: 'Argentina',
        sector: 'Biofuels',
        value: ' 2.89 '
      },
      {
        year: '2009',
        geography: 'Argentina',
        sector: 'Biofuels',
        value: ' 1.25 '
      },
      {
        year: '2009',
        geography: 'Argentina',
        sector: 'Wind',
        value: ' 191.43 '
      }
    ]

    let expected = [
      {
        id: 'investment',
        subindicator: 'Investment',
        geography: 'Argentina',
        values: [
          {
            'year': 2006,
            'value': 2.89
          },
          {
            'year': 2009,
            'value': 192.68
          }
        ]
      }
    ]

    it('aggregate investment data', async () =>
      assert.deepEqual(process.investmentData(input), expected, 'Data not aggregated properly')
    )
  })
})
