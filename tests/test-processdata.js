'use strict'
const assert = require('chai').assert

const process = require('../scripts/process-data')

describe('Process Data', function () {
  describe('Geographies', async () => {
    let inputGeographies = [{ id: 'UY', name: 'Uruguay', grid: 'off', region: 'lac' }]
    let inputRegions = [{ id: 'lac', name: 'Latin America and the Caribbean' }]
    let expected = [{
      iso: 'uy',
      name: 'Uruguay',
      grid: 'off',
      region: {
        id: 'lac',
        name: 'Latin America and the Caribbean'
      }
    }]

    it('format geographies and add region information', async () =>
      assert.deepEqual(process.geographies(inputGeographies, inputRegions), expected, 'Not processed properly')
    )
  })
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
      assert.deepEqual(process.investments(input, [2006, 2009]), expected, 'Data not aggregated properly')
    )
  })
})
