'use strict'
const assert = require('chai').assert

const utils = require('../scripts/utils')

describe('Utils', function () {
  describe('averageValues', async () => {
    it('averages an array of values', async () => {
      let input = [{ 'value': 25 }, { 'value': 36 }]
      assert.deepEqual(utils.averageValues(input), 30.5, `Doesn't average an array of objects properly`)
    })

    it('disregards null when averaging an array of values', async () => {
      let input = [{ 'value': 25 }, { 'value': 36 }, { 'value': null }]
      assert.deepEqual(utils.averageValues(input), 30.5, `Doesn't average an array of objects properly`)
    })
  })

  describe('emptyStringsNull', async () => {
    it('turn values with empty string in object to null', async () => {
      let input = { 'name': 'I feel', 'unit': '' }
      let expected = { 'name': 'I feel', 'unit': null }
      assert.deepEqual(utils.emptyStringsNull(input), expected, `Doesn't cast empty strings to null`)
    })
  })

  describe('fillMissingValues', async () => {
    it('fills an array with 0 values for missing years', async () => {
      let input = [{ 'year': 2020, 'value': 25 }, { 'year': 2018, 'value': 36 }]
      let years = [2020, 2019, 2018]
      let expected = [{ 'year': 2020, 'value': 25 }, { 'year': 2019, 'value': 0 }, { 'year': 2018, 'value': 36 }]
      assert.deepEqual(utils.fillMissingValues(input, years), expected, `Doesn't fill array with 0 values`)
    })
  })

  describe('orderByYear', async () => {
    it('orders an array of values by year', async () => {
      let input = [{ 'year': 2020, 'value': 25 }, { 'year': 2019, 'value': 36 }]
      let expected = [{ 'year': 2019, 'value': 36 }, { 'year': 2020, 'value': 25 }]
      assert.deepEqual(utils.orderByYear(input), expected, `Doesn't order an array of objects by the year property`)
    })
  })

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

  describe('getLatestValue', async () => {
    it('gets the latest value from array', async () => {
      let input = [{ 'year': 2020, 'value': 25 }, { 'year': 2019, 'value': 36 }]
      let expected = { 'year': 2020, 'value': 25 }
      assert.deepEqual(utils.getLatestValue(input), expected, `Doesn't get the latest value from array`)
    })
  })
})
