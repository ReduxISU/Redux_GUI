## Deployment

This application can be deployed by building a binary only standalone version of the app with a next.js build script. Assuming you have npm installed, 
and you are in the project's root directory, you can run the following:

````
npm install
npm build
npm start
````

This will start a production server on the port 3000 of your host machine. 

<br>

This application can be also be deployed via a docker docker image. To do so run the following:

````
npm run build
docker build -t reduxgui .
docker run -it --rm -p 3000:3000 --name reduxgui reduxgui

````
This will start a local server via docker. Note that this server is using production binaries, so warnings will be distinct from the development environment described in the usage section.