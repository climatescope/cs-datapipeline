# Climatescope Data Pipeline
The pipeline prepares data for use on the global-climatescope.org. Any change made to the CSV files in the `./input` folder, are automatically picked up by Circle and pushed to the [main Climatescope repository](https://github.com/climatescope/climatescope-org).

## Editing data
Any changes merged into the `master` branch will automatically be picked up. The pipeline performs automatic tests on the input data to make sure it is well formatted. For an overview of the data requirements, please see the [Input Data readme](input/README.md).

1. **Edit the file**
Browse to the file you want to edit, click the pencil icon and make the changes.  
If you are making a lot of changes, you can do this offline and choose the option 'Upload files' in the corresponding folder. If you go this route, make sure you are uploading a file with the correct file-name.
2. **Commit your changes and open a Pull Request**  
You will forced to open a new branch. Out of safety precautions, it is not possible to make changes straight to `master`. This allows the pipeline to run the sanity checks and make sure the data is well structured.  
After you hit commit, Github will ask you to open a Pull Request.
3. **Merge the changes to master**  
Circle CI will automatically detect the Pull Request and run tests on the input data. If they pass, you can merge the Pull Request to the `master` branch.  
If the tests fail, this will be clearly indicated. You can also look at the details to see what needs to be corrected. It is not possible to merge the Pull Request until the failing tests are fixed.

## How to add a new edition
Instructions forthcoming.

## Running the project locally
Install the dependencies:

`yarn install`

Run the pipeline and produce results:

`yarn build`
