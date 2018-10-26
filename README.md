# Climatescope Data Pipeline
The pipeline that prepares data for use on the global-climatescope.org.

Install the dependencies:

`yarn install`

Run the pipeline:

`node index.js`

## Pipeline notes
Loose notes to be organized:

- The pipeline will generate data for the geographies and topics that are in: `./input/geographies.csv` and `./input/topics.csv`. If a geography is included in `scores.csv`, but not in the `geographies.csv` it will not be picked up.
