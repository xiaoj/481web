481web
======
This github repo contains everything you need to host our app either locally or on Heroku.

Host Locally
------
1. Clone this project.
2. Open a terminal and cd to the project root
2. Run the following command: ./node app.js.
3. Open browser and navigate to localhost:8888. Note: you must clear your browser's cache and saved app data everytime the app changes.

Host on Heroku
------
1. Clone this project.
2. Open a terminal and cd to the project root.
3. Run the following command: git push <url of your heroku app>

Files to Note
------
* /app.js - This is a node.js app which serves our app.
* /default - This directory contains the code for ODK. You can learn more about ODK [here](http://opendatakit.org/use/collect/)
* /neonatal - This directory contains the code specific to our app. You can learn more about the architecture of our app from our paper.
* /presentation - Contains the final version and supporting files for our presentation.
* /paper - Contains the final version and supporting files for our paper.
* /report - Contains our final report and appendices with helpful
  information on aspects of our app specifically and ODK in general.
* convertPhantom - command line conversion from xlsx to json.

Convert Spreadsheet to JSON
------
* cd into project root
* run ./phantomjs convertPhantom neonatal/neonatal.xlsx > neonatal/formDef.json
* Remember to clear browser chache and saved app data.

Files to Grade
------
* neonatal/neonatal.xlsx - Our ODK spreadsheet.
* neonatal/customPrompts.
