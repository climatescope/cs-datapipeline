# Climatescope Data Pipeline
The pipeline prepares data for use on the global-climatescope.org. Any change made to the CSV files in the `./input` folder, are automatically picked up by Circle and pushed to the [main Climatescope repository](https://github.com/climatescope/climatescope.org).

## Editing data
Any changes merged into the `master` branch will automatically be picked up. The pipeline performs automatic tests on the input data to make sure it is well formatted. For an overview of the data requirements, please see the [Input Data readme](input/README.md).

1. **Edit the file**  
Browse to the file you want to edit, click the pencil icon and make the changes.  
When making a lot of changes, you can also do this in a spreadsheet editor and choose to 'Upload files' after. If you go this route, make sure you are uploading a file with the correct file-name, in the correct folder.
2. **Commit your changes and open a Pull Request**  
When you commit your changes, you will be forced to open a new branch. This allows the pipeline to run the sanity checks and make sure the data is well structured, before publishing it to the main repo.
3. **Open a Pull Request**
4. **Check if the tests pass**  
Circle CI will automatically detect the Pull Request and run tests on the input data. If the tests fail, this will be clearly indicated. By inspecting the detailed results, you will have an indication of what needs to be corrected. It is not possible to merge the Pull Request until the failing tests are fixed.
5. **Merge the changes to master**  
Once the tests pass, you can merge the Pull Request to the `master` branch.

## Updating section copy
The copy for each of the sections on the country pages is stored in the CSV file with subindicators.csv. Updating the copy of these sections can be done through this file, following the instruction to [edit the data](#editingdata).

## How to add a new edition
Instructions forthcoming.

## Running the project locally
Install the dependencies:

`yarn install`

Run the pipeline and produce results:

`yarn build`
