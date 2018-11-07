'use strict'
const assert = require('chai').assert

const utils = require('../scripts/utils')

describe('Utils', function () {
  describe('parseValue', async () => {
    it('parses a number as a number', async () =>
      assert.typeOf(utils.parseValue('12'), 'number', `Doesn't parse a number properly`)
    )

    it('parses an empty string as null', async () =>
      assert.equal(utils.parseValue(''), null, `Doesn't parse an empty string properly`)
    )

    it(`parses a '-' as 0`, async () =>
      assert.equal(utils.parseValue('-'), 0, `Doesn't parse a hyphen properly`)
    )
  })

  describe('orderByYear', async () => {
    it('orders an array of values by year', async () => {
      let input = [{ 'year': 2020, 'value': 25 }, { 'year': 2019, 'value': 36 }]
      let expected = [{ 'year': 2019, 'value': 36 }, { 'year': 2020, 'value': 25 }]
      assert.deepEqual(utils.orderByYear(input), expected, `Doesn't order an array of objects by the year property`)
    })
  })
})
