# serverless-tutorial

Learn how to develop a full-stack web app using only a web browser, and host it in the cloud for free

This tutorial will show how to:
- Create a client-side web app using HTML and JavaScript, hosted on GitHub
- Add serverless functions for database connectivity and deploy the app to Netlify
- Store the web app data in the cloud with Couchbase

## Part One: GitHub

To get started, let's create a static web page and host it on GitHub

Reference: https://pages.github.com/

- Create or sign in to your account on [github.com](https://github.com/)
- Create a new public repository named *username*.github.io
- In the new repository, click Add file > Create new file
- Name the file index.html and paste the following content
~~~
<!DOCTYPE html>
<html>
<body>
<h1>Hello World</h1>
<p>I'm hosted with GitHub Pages.</p>
</body>
</html>
~~~
- Click Commit changes

Note: you may prefer to view and edit files in your repository using [github.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor)

- To see your published web page, open a new browser tab and go to: https://*username*.github.io

At this point you may choose to experiment with adding and updating pages in the repo. As you commit changes they will automatically be deployed to the live web site.

---

Now let's turn that static web page into a dynamic web app using JavaScript.

Reference: https://www.taniarascia.com/javascript-mvc-todo-app

- In the same repo, select index.html, click the pencil to Edit this file, and replace the original Hello World example with the following content:
~~~
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />

    <title>Todo App</title>

    <link rel="stylesheet" href="style.css" />
  </head>

  <body>
    <div id="root"></div>

    <script src="script.js"></script>
  </body>
</html>
~~~
- Click Commit changes
- Click Add file, name it style.css, and copy and paste the content from the following link: https://github.com/taniarascia/mvc/blob/master/style.css
- Click Commit changes  
- Click Add file, name it script.js, and copy and paste the content from the following link: https://github.com/taniarascia/mvc/blob/master/script.js
- Click Commit changes  

Note: feel free to follow along with that MVC tutorial (referenced above) and build up script.js one step at a time

- View the updated web app at: https://*username*.github.io

Keep in mind that it may take a few seconds for committed changes to be deployed to the live site. Also, when updating JavaScript, you may need to force reload the page to see the latest changes.

- Try adding, deleting, and marking Todos complete
- Reload the page
 
This client-side web app uses localStorage to remember the changes you've made when you reload the page within the same browser. But to have those changes show up in a different browser and/or on a different device, we'll need to connect to a database.

## Part Two: Netlify

With traditional [LAMP](https://en.wikipedia.org/wiki/LAMP_(software_bundle)) development, our web app would call PHP functions running on a server to access a MySQL database. In many cases the client-side HTML and JavaScript files would be served from the same host that is also running the PHP and MySQL. With serverless functions, we'll replace the PHP with Node.js (one of many choices) that connects to a Couchbase database (again, one of many choices). Netlify takes care of running the functions, so we don't need to maintain a server.

Reference: https://developer.couchbase.com/tutorial-quickstart-netlify/

First we'll deploy our web app from GitHub to Netlify and make sure it still works as-is.

- Create or sign in to your account on [netlify.com](https://www.netlify.com/)
  - Choose Sign up with GitHub for easier integration
  - Select the Free tier
- Click Add new project > Import an existing project
- Click GitHub
- Select the *username*.github.io repo
- Leave all the default settings and click Deploy *username*.github.io
- Click the link to open https://*random-project-name*.netlify.app

We now have two separate instances of the application running on github.io and netlify.app.

Before going on, let's see what happens when we make a small change to the app.

- In GitHub, edit script.js and change the following line from this:
  
~~~
this.title.textContent = 'Todos'
~~~
  
- To this:

~~~
this.title.textContent = 'Todo List'
~~~

- Click Commit changes
- View the updated web app at: https://*username*.github.io

Remember you might need to force reload to see the change.

- Also view the updated web app at: https://*random-project-name*.netlify.app

Both GitHub and Netlify automatically redeployed the app based on the new commit.

---

Now let's add a serverless function.

- In the same GitHub repo, click Add file > Create new file
- Name the file netlify/functions/loadTodos/loadTodos.js

This is the default location where Netlify will look for serverless functions. To create subdirectories in GitHub you can simply type the full path in the name field.

- Paste the following contents

~~~
// TODO connect to database

const handler = async (event) => {
  // only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
    }
  }

  try {

    // TODO query database

    const results = [{id: 1, text: "Create a serverless function", complete: false}];

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
~~~

- Click Commit changes

The tutorial referenced above explains why the serverless function is structured this way. We'll fill in the parts about connecting to the database in Part Three. For now let's update script.js and make sure the client-side script is able to call the serverless function and get the expected result.

At the bottom of script.js is the following line, which initializes the web app:

~~~
const app = new Controller(new Model(), new View());
~~~

- Edit script.js and replace that line with the following lines:

~~~
async function setTodos() {
  const response = await fetch('/.netlify/functions/loadTodos');
  const json = await response.json();
  localStorage.setItem('todos', JSON.stringify(json));

  const app = new Controller(new Model(), new View());
}
setTodos();
~~~

- Click Commit changes

 Note: this is the minimal amount of code needed to call our serverless function and place the result in localStorage before initializing the app. In a real application it might be better to create a new class that connects to the database with error handling and manages data synchronization.

- View the updated web app at: https://*random-project-name*.netlify.app

Note: the web app will no longer work on GitHub because it now uses a serverless function provided by Netlify. If you open the app at https://*username*.github.io and look in the JavaScript console you will see an error like "/.netlify/functions/loadTodos:1  Failed to load resource: the server responded with a status of 404 ()"
- Go ahead and check the box next to Create a serverless function. You can also try adding and deleting todos.
- Reload the page

Notice that it forgot your changes. That's because we're not yet saving them to a database (and not really loading them either, but overwriting localStorage on load). For that we'll need to create a second serverless function. But first, let's set up the database.

## Part Three: Couchbase

Reference: https://www.couchbase.com/blog/get-started-couchbase-capella

- Create or sign in to your account on [couchbase.com](https://www.couchbase.com/)
  - Choose Sign up with GitHub for easier integration

When you first create an account you will be guided through a quick start to set up a cluster. Your experience may vary but you can always make changes later in cluster settings. Here are the important steps:
  
- Click on Create Cluster
  - Choose the Free tier (you can have one cluster at a time on the free tier)
  - Accept random cluster name or change it
  - Choose any provider (AWS/Azure/Google Cloud)
  - Scroll to the bottom of the page and click Create Cluster
  - Wait a few minutes for the cluster to be started (it will say Healthy)
- Click on the name of your cluster
- Click Connect
- Copy the Public Connection String, e.g. couchbases://cb.*random*.cloud.couchbase.com
- Click on Allowed IP Addresses
  - Click Add Allowed IP
  - Click Allow Access from Anywhere and click Add Allowed IP
    - This should have added an entry for 0.0.0.0/0
- Click Cluster Access and then click Create Cluster Access
  - Enter a Cluster Access Name
    - This is a database username, not your account username, e.g. todos_user
  - Enter a password (and copy it for later use)
  - Under Bucket-Level Access, select All Buckets, All Scopes, Read/Write
- Navigate to the Data Tools tab and click Create
  - Select New Bucket and set the Name, Scope, and Collection to todos

In case you were not able to follow those steps exactly, here are the important settings to check:
- Public Connection String
- Allowed IP = 0.0.0.0/0
- Cluster Access Name
- Cluster Access Password
- Bucket, Scope, Collection name (all todos)

These settings will tell our serverless function how to connect to the database. Let's set that up now.

- In Netlify, click on the name of your project
- Click on Project configuration
- Click on Environment variables
- Scroll down and click Add a variable > Import from a .env file
- In Contents of .env file, enter your access credentials (it will look similar to the following)

~~~
COUCHBASE_ENDPOINT=cb.RANDOM_STRING.cloud.couchbase.com
COUCHBASE_BUCKET=todos
COUCHBASE_USERNAME=todos_user
COUCHBASE_PASSWORD=TODOS_PASSWORD
~~~

- Click Import variables

Using environment variables is recommended over including access credentials directly in your code.

Now we are ready to create our second serverless function.

- In GitHub, click Add File, name it netlify/functions/saveTodos/saveTodos.js, and paste in the following content:

~~~
const couchbase = require('couchbase')

const ENDPOINT = process.env.COUCHBASE_ENDPOINT
const USERNAME = process.env.COUCHBASE_USERNAME
const PASSWORD = process.env.COUCHBASE_PASSWORD
const BUCKET = process.env.COUCHBASE_BUCKET

const couchbaseClientPromise = couchbase.connect('couchbases://' + ENDPOINT, {
  username: USERNAME,
  password: PASSWORD,
  timeouts: {
    kvTimeout: 10000, // milliseconds
  },
})

const handler = async (event) => {
  // only allow PUT requests
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
    }
  }

  try {
    const cluster = await couchbaseClientPromise
    const bucket = cluster.bucket(BUCKET)
    const scope = bucket.scope(BUCKET)
    const collection = scope.collection(BUCKET)

    const result = await collection.upsert('todos', event.body)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
~~~

- Click Commit changes
  
At the top of this serverless function, the database credentials are loaded from the environment variables. A connection to the database is then established. When this serverless function is called, it will update the database with the body of the message. The key part of the function is this line:

~~~
const result = await collection.upsert('todos', event.body)
~~~

Next, we need to modify script.js to call the new serverless function.

- Edit script.js and add these lines at the bottom, right below the setTodos() function we added earlier:

~~~
const localStorageSetHandler = async function(e) {  
  const result = await fetch('/.netlify/functions/saveTodos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(localStorage.getItem('todos')),
    });
    console.log(result);
};
document.addEventListener("localStorageSet", localStorageSetHandler, false);
~~~

We need to make one more change to script.js to call this event handler when the todos are updated.

- Edit script.js and near the top, insert the following line into the _commit(todos) function so it looks like this:

~~~
_commit(todos) {
  this.onTodoListChanged(todos)
  localStorage.setItem('todos', JSON.stringify(todos))
    
  document.dispatchEvent(new Event('localStorageSet'));
}
~~~

Now that we're able to save todos to the database, we also need to update our first serverless function to read them back from the database.

- Edit netlify/functions/loadTodos/loadTodos.js so that it looks like the following:

~~~
const couchbase = require('couchbase')

const ENDPOINT = process.env.COUCHBASE_ENDPOINT
const USERNAME = process.env.COUCHBASE_USERNAME
const PASSWORD = process.env.COUCHBASE_PASSWORD
const BUCKET = process.env.COUCHBASE_BUCKET

const couchbaseClientPromise = couchbase.connect('couchbases://' + ENDPOINT, {
  username: USERNAME,
  password: PASSWORD,
  timeouts: {
    kvTimeout: 10000, // milliseconds
  },
})

const handler = async (event) => {
  // only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
    }
  }

  try {

    const cluster = await couchbaseClientPromise
    const bucket = cluster.bucket(BUCKET)
    const scope = bucket.scope(BUCKET)
    const collection = scope.collection(BUCKET)

    const results = await collection.get(BUCKET)

    return {
      statusCode: 200,
      body: results.value,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
~~~

- Click Commit changes
- View the updated web app at: https://*random-project-name*.netlify.app

That last commit should have kicked off a new build, but the behavior hasn't changed. That's because we intentionally skipped a step which led to a build failure. This is a good opportunity to learn what to do when that happens.

- In Netlify, click on *random-project-name*
- Scroll down and click on the most recent Production deploy, which Failed
- Click on Why did it fail?

The AI gave me the correct analysis:

**Diagnosis**

The build failed due to a dependency installation error related to a Netlify Function. The error message indicates that the function saveTodos requires the 'couchbase' module, but it cannot be found.

**Solution**

1. Verify that the 'couchbase' module is included in the site's top-level package.json file.
2. If the 'couchbase' module is missing, add it to the dependencies in the package.json file using npm:

~~~
npm install couchbase
~~~

3. After adding the 'couchbase' module, commit the changes to the repository and trigger a new build to ensure the function can find the required dependency.

We'll go over running `npm install` in Part Four. For now let's just create that package.json file in GitHub.

- In the GitHub repo, add a file named package.json and paste the following content:

~~~
{
  "dependencies": {
    "couchbase": "^4.4.6"
  }
}
~~~

- Click Commit changes

Now the build should pass and the deploy will say Published.





- View the updated web app at: https://*random-project-name*.netlify.app

- 



## Part Four: Local Development

This tutorial has shown that it is possible to develop and deploy a full-stack web app using only a web browser. Eventually you will want to do local development on your computer. Here are the basic steps.

- If necessary, install git: https://github.com/git-guides/install-git

## Part Five: Extra Credit

- GitLab, Bitbucket
- deploy from github to Vercel
- Data access layer and MongoDB, even MySQL
- https://docs.netlify.com/domains/configure-domains/bring-a-domain-to-netlify/


