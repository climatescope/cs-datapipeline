'use strict'

// Process raw investment data
// Aggregate values by year, sector and geography
function processInvestmentData (data) {
  return data
    .filter(d => Number(d.year) > 2000 && Number(d.year) < 2100)
    .reduce((acc, b) => {
      let v = {
        year: Number(b.year),
        value: Number(b.value)
      }

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
        let yrMatch = match.values.find(v => v.year === Number(b.year))

        if (yrMatch) {
          yrMatch.value += Number(b.value)
        } else {
          match.values = match.values.concat(v)
        }

        return acc
      }
    }, [])
}

module.exports = {
  investmentData: processInvestmentData
}
