481web
======
This github repo contains everything you need to host our app either locally or on Heroku.

Host Locally
------
1. Clone this project.
2. Open a terminal and cd to the project root
2. Run the following command: ./node app.js. Note: The terminal will not output anything, it will just display a flashing cursor.
3. Open browser and navigate to localhost:8888. Note: you must clear your browser's cache and saved app
4. data everytime the app changes.


Host on Heroku
------
1. Clone this project.
2. Open a terminal and cd to the project root.
3. Run the following command: git push <url of your heroku app>


Files to Note
------
* /app.js - This is a node.js app which redirects a user to the odk app.
* /default - This directory contains the code for ODK. You can learn more about ODK [here](http://opendatakit.org/use/collect/)
* /neonatal - This directory contains the code specific to our app. You can learn more about the architecture of our app from our paper.
* /Presentation - Contains the final version and supporting files for our presentation.
* /paper - Contains the final version and supporting files for our paper.

