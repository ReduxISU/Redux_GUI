To use the Redux GUI on your machine, please note that it is **integrally linked to the Redux REST API,** which can be found [here](https://github.com/ReduxISU/Redux). This means that that you can make superficial changes to the Redux GUI application as long as you don't need new types of API calls that are not yet implemented. If you do need to work on the Redux GUI and the Redux API at the same time, then you will need to do the following:

````
1. clone the Redux API
2. launch the Redux API using dotnet run
3. launch the Redux GUI development server on port 3000 by using:
 npm run dev

````
This will allow you to immediately use any unmerged and undeployed changes that you make to the backend on the frontend.

