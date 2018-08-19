# lps.js Demo Web App (Server-side)

This repository holds the server-side web app for the [lps.js](https://github.com/mauris/lps.js) demonstration website. This web app is made using Express.js Framework. The frontend repository of the web app can be found at https://github.com/mauris/lps-demo-web

### Set up

After cloning the repository, you need to install the dependencies described in `package.json` by running the command:

    $ npm i
    
Whenever `package.json` gets modified, you should run `npm i` to install new dependencies or update existing ones.

Ensure that a copy of lps.js's repository is cloned to `lps` folder next to `lps-demo-web-api`.

### Configuring the Server Environment

Make a copy of of `sample.env` and rename it to `.env` ; this is a file containing Server Environment directory used by the scripts.
    

### Running Web App

To run the web app, run the command:

    $ npm start
    
By default, the web server will run on port `3000`. Hence when you visit http://localhost:3000/, you should see the web app responding.

If you're in development environment and would like the app to restart whenever you make changes (the changes to the app will not be reflected unless the app is restarted), you can use a library called `nodemon` to help you do this. Install `nodemon` globally by running the command:

    $ npm i -g nodemon
    
After installing `nodemon`, you can use `nodemon` instead of `npm start` to monitor and restart the web app as needed.

### Running Tests

To run tests, run the command:

    $ npm test
    
We're writing unit tests using Mocha unit testing framework. Test files are found in the `test` folder.
    
### Code Linting

To run code linting, run the command:

    $ npm run lint
    
Code linting tool we're using is ESLint.


# License

The lps.js demo web app is open source and licensed under the BSD 3-Clause. The implementation depends on the LPS runtime [lps.js](https://github.com/mauris/lps.js). lps.js was implemented as part of Sam Yong's MSc Computer Science Individual Project and thesis at Imperial College London in 2018.
