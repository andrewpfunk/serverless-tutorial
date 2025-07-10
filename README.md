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

Keep in mind that it will take a few seconds for committed changes to be deployed to the live site. Also, when updating JavaScript, you may need to force reload the page to see the latest changes.

- Try adding, deleting, and marking Todos complete
- Reload the page
 
This client-side web app uses localStorage to remember the changes you've made when you reload the page within the same browser. But to have those changes show up in a different browser or on a different device, we'll need to connect to a database.

## Part Two: Netlify

With traditional [LAMP](https://en.wikipedia.org/wiki/LAMP_(software_bundle)) development, our web app would call PHP functions running on a server to access a MySQL database. In many cases the client-side HTML and JavaScript files would be served from the same host that is also running the PHP and MySQL. With serverless functions, we'll replace the PHP with Node.js (one of many choices) that connects to a Couchbase database (also one of many choices). Netlify takes care of running the functions, so we don't need to maintain a server.

Reference: https://developer.couchbase.com/tutorial-quickstart-netlify/

First we'll deploy our web app from GitHub to Netlify and make sure it still works as-is.

- Create or sign in to your account on [netlify.com](https://www.netlify.com/)
  - Choose Sign up with GitHub for easier integration
  - Select the Free tier
- Click Add new project > Import an existing project
- Click GitHub
- Select the repo named: *username*.github.io
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

- Edit script.js and near the top, change the beggining of the Model class definition from this:

~~~
class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
  }
~~~

- To this:

~~~
class Model {
  constructor() {
    this.loadTodos();
  }

  loadTodos() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || []  
  }
~~~

We needed to pull that call to localStorage.getItem('todos') outside of the Model constructor so that we can call it again after the model has been created.

Next we'll create a reloadTodos() function that calls this function. Scroll down to the bottom of the file and find the definition of the handleToggleTodo function.

- Right after that definition add a new function:

~~~
reloadTodos = () => {
  this.model.loadTodos();
  this.view.displayTodos(this.model.todos);
}
~~~

Finally, at the bottom of script.js is the following line, which initializes the web app:

~~~
const app = new Controller(new Model(), new View());
~~~

- Add the following block of code right after that line:

~~~
fetch('/.netlify/functions/loadTodos').then(response => {
  if (response.status === 200) {
    response.json().then(json => {
      localStorage.setItem('todos', JSON.stringify(json));
      app.reloadTodos();      
    });   
  }
});
~~~

- Click Commit changes

Note: this is the minimal amount of code needed to call our serverless function, place the result in localStorage, and then reload the todos into the app. In a real application it would be better to create a new class that manages database connectivity for data synchronization.

- View the updated web app at: https://*random-project-name*.netlify.app

Note: the web app will continue to work on GitHub the way it did at the end of Part One, but the new functionality that relies on serverless functions will only work on Netlify. If you open the app at https://*username*.github.io and look in the JavaScript console you will see an error like "GET https://*username*.github.io/.netlify/functions/loadTodos 404 (Not Found)"

- Go ahead and check the box next to Create a serverless function. You can also try adding and deleting todos.
- Reload the page

Notice that it forgot your changes. That's because we're not yet saving them to a database (and not really loading them either, but overwriting localStorage on load). For that we'll need to create a second serverless function. But first, let's set up the database.

## Part Three: Couchbase

Reference: https://www.couchbase.com/blog/get-started-couchbase-capella

- Create or sign in to your account on [couchbase.com](https://www.couchbase.com/)

When you first create an account you will be guided through a quick start to set up a cluster. Your experience may vary but you can always make changes later in cluster settings. Here are the important steps:
  
- Click on Create Cluster
  - Choose the Free tier (you can have one cluster at a time on the free tier)
  - Accept random cluster name or change it
  - Choose any provider (AWS/Azure/Google Cloud)
  - Scroll to the bottom of the page and click Create Cluster
  - Wait a few minutes for the cluster to be started (it will say Healthy)
- Click on the name of your cluster
- Click Connect
- Copy the Public Connection String, e.g. couchbases://cb.*random_string*.cloud.couchbase.com
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

Now we are ready to have our serverless function connect to the database.

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

At the top of this serverless function, we load the database credentials from the environment variables and then establish a connection to the database. When this serverless function is called, it will get the value of the todos document (JSON object) from the database and return it to the caller. The key part of the function is this line:

~~~
const results = await collection.get(BUCKET)
~~~

Note: we're using the value of the BUCKET environment variable for the Bucket, Scope, Collection, and document ID in this case. That's because our simple app only needs to store a single document. In a real application these would likely all be different. For more information see: https://docs.couchbase.com/cloud/clusters/data-service/about-buckets-scopes-collections.html

- Click Commit changes
- View the updated web app at: https://*random-project-name*.netlify.app

That last commit should have kicked off a new build, but the behavior of our app hasn't changed. That's because we intentionally skipped a step which led to a build failure. This is a good opportunity to learn what to do when that happens.

- In Netlify, click on *random-project-name*
- Scroll down and click on the most recent Production deploy, which Failed
- Click on Why did it fail?

The AI gave me the correct analysis:

---

**Diagnosis**

The build failed due to a dependency installation error related to a Netlify Function. The error message indicates that the function loadTodos requires the 'couchbase' module, but it cannot be found.

**Solution**

1. Verify that the 'couchbase' module is included in the site's top-level package.json file.
2. If the 'couchbase' module is missing, add it to the dependencies in the package.json file using npm:

~~~
npm install couchbase
~~~

3. After adding the 'couchbase' module, commit the changes to the repository and trigger a new build to ensure the function can find the required dependency.

---

We'll run `npm install` in Part Four. For now let's just create that package.json file manually in GitHub.

- In the GitHub repo, add a file named package.json and paste the following content:

~~~
{
  "dependencies": {
    "couchbase": "^4.5.0"
  }
}
~~~

- Click Commit changes

Now the build should pass and the deploy will say Published.

To complete the functionality of our app, we need to add another serverless function that saves our Todo list to the database.

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

This function is similar to the contents of loadTodos.js. But instead of loading todos from the database, when this function is called it will update the database with the current value of todos. The key part of the function is this line:

~~~
const result = await collection.upsert('todos', event.body)
~~~

Next, we need to modify script.js to call the new serverless function.

- Edit script.js and add these lines at the bottom, right below the block of code we added earlier:

~~~
const localStorageSetHandler = async function(e) {  
  try {  
    const result = await fetch('/.netlify/functions/saveTodos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: localStorage.getItem('todos'),
      });    
  } catch (error) {
    console.error(error.message);
  }
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

- Click Commit changes
- View the updated web app at: https://*random-project-name*.netlify.app
- Try adding, deleting, and marking Todos complete
- Reload the page (allow time for communication with the database)

Whatever changes we've made should be preserved. But more importantly, if we open the app in a different browser, or on a different device, we should see the same Todo list. And any changes made in that other browser or device should be reflected back in the first browser (after a reload). 

Note: the app is now totally dependent on the database and not really using localStorage. In a real application, we should rely on localStorage first and only connect to the database when necessary to synchronize data.

## Part Four: Local Development 🚧

This tutorial has shown that it is possible to develop and deploy a full-stack web app using only a web browser. Eventually you will want to do local development on your computer. Here are the basic steps. Note: some of these commands may differ between Linux, Mac, and Windows. 

- If necessary, install git: https://github.com/git-guides/install-git

Note: this tutorial will only cover the basics of using Git and will not go into branching or other details. Here is a good tutorial: https://learngitbranching.js.org/

- Follow these instructions to generate an SSH key and add it to your GitHub account: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- In your repository on github.com, Click on Code, select the SSH tab, and copy the URL to clipboard
- In a Terminal window on your computer, cd to an empty directory, type 'git clone ', paste the URL, and hit return, e.g.:
  - ` git clone git@github.com:andrewpfunk/andrewpfunk.github.io.git`
- `cd USERNAME.github.io`

In this directory you should see the files you created on github.com. 

- If necessary, install Node.js and npm: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- Use npm to install Netlify CLI: https://docs.netlify.com/cli/get-started/
- In the *username*.github.io directory, create a file named .env with the environment variables you set above
- In a Terminal window run: ```netlify dev```

If the required dependencies have all been installed correctly, the web app should open in a new browser tab at http://localhost:8888/. If it doesn't work, look for error messages shown in the Terminal window and try to follow the instructions to fix any problems.

- Try adding, deleting, and marking Todos complete

Remember to allow time for communication to and from the database. The behavior of the web app should be the same on your computer as it was on netlify.app. 

---

If we hadn't manually created package.json in GitHub, let's see how we could create it by running `npm install`. Run these commands in a Terminal window:

- `cd USERNAME.github.io`
- `rm package.json`
- `npm init`

Follow the interactive prompts and answer 'yes' to generate a new package.json file.

- `npm install couchbase`

The package.json file should now include a "dependencies" node with minimum couchbase version, similar to the one we created manually.

Now the version of package.json in our local repo is different from the one on github.com. Let's push the local version to GitHub so they'll be in sync.

- `git status`

~~~
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   package.json
~~~

- `git add package.json`
- `git status`

~~~
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   package.json
~~~

- `git commit`

This will open a text editor and prompt you to enter a commit message, e.g. "Regenerated package.json using npm install"

- Save the file and exit the text editor
- `git status`

~~~
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)
~~~

- `git push`

Now the version of package.json on github.com should match the one in your local repository. To sync in the other direction we use 'git pull'.

- On github.com, edit package.json to have a different description, e.g. "MVC Todos App"
- Click Commit changes
- In a Terminal window run `git pull`

~~~
 package.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
~~~

The local version of package.json should again match the one on github.com.

Note: you can also manage these operations using the Source Control panel within VS Code or another IDE.

---

Every time we open or reload our app, it loads the Todo list from the database. But if a change is made to the list on another device, we won't know until we reload the app. Let's make some more changes to the app so that it periodically checks the database on its own. We'll make the changes and test them locally at first, then sync them to GitHub and deploy them to Netlify.

Let's start by opening script.js in a local text editor.

Note: this tutorial will assume we're using VS Code, which will provide a similar experience to github.dev. Feel free to use your favorite text editor instead.

- `cd USERNAME.github.io`
- `code script.js`





---

Next steps...
- anything else missing from dependencies / setup instructions?
- add an update function with setInterval
- demonstrate git fetch, add, commit, push, ...



## Part Five: Alternatives 🚧

- GitLab, Bitbucket
- deploy from github to Vercel
- Data access layer and MongoDB, even MySQL
- https://docs.netlify.com/domains/configure-domains/bring-a-domain-to-netlify/


