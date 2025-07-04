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
  - Note: you may prefer to view and edit files in your repository using [github.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor)
- To see your published web page, open a new browser tab and go to: https://*username*.github.io

At this point you may choose to experiment with adding and updating pages in the repo. As you commit changes they will automatically be deployed to the live web site.

---

Now let's turn that static web page into a dynamic web app using JavaScript.

Reference: https://www.taniarascia.com/javascript-mvc-todo-app

- In the same repo, select index.html, click the pencil to Edit this file, and replace the original Hello World example with the following content
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
- Click Add file, name it style.css, copy and paste the content from the following link, and click Commit changes
  - https://github.com/taniarascia/mvc/blob/master/style.css
- Click Add file, name it script.js, copy and paste the content from the following link, and click Commit changes
  - https://github.com/taniarascia/mvc/blob/master/script.js
  - Note: feel free to follow along with that tutorial (referenced above) and build up script.js one step at a time
- View the updated web app at: https://*username*.github.io
  - Keep in mind that it may take a few seconds for committed changes to be deployed to the live site
  - When editing JavaScript, you may need to force reload the page to see the latest changes
 
This client-side web app uses localStorage to persist the app data across sessions within the same browser. To persist data across devices, we'll need to connect to a database.

## Part Two: Netlify

With traditional [LAMP](https://en.wikipedia.org/wiki/LAMP_(software_bundle)) development, our web app would call PHP functions running on a server to access a MySQL database. In many cases the client-side HTML and JavaScript files would be served from the same host that is also running the PHP and MySQL. With serverless functions, we'll replace the PHP with [Node.js](https://nodejs.org/) (one of many choices) that connects to a Couchbase database (again, one of many choices). Netlify takes care of running the functions, so we don't need to maintain a server.

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
  - Remember you might need to force reload to see the change
- Also view the updated web app at: https://*random-project-name*.netlify.app

Both GitHub and Netlify automatically redeployed the app based on the new commit.

---

Now let's add a serverless function.

- In the same GitHub repo, click Add file > Create new file
- Name the file netlify/functions/loadTodos/loadTodos.js
  - This is the default location where Netlify will look for serverless functions
  - To create subdirectories in GitHub you can simply type the full path in the name field
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
  - Note: this is the minimal amount of code needed to call our serverless function and place the result in localStorage before initializing the app. In a real application it might be better to create a new class that connects to the database with error handling and manages data synchronization.

- View the updated web app at: https://*random-project-name*.netlify.app
  - Note: the web app will no longer work on GitHub because it now uses a serverless function provided by Netlify. If you open the app at https://*username*.github.io and look in the JavaScript console you will see an error like "/.netlify/functions/loadTodos:1  Failed to load resource: the server responded with a status of 404 ()"
- Go ahead and check the box next to Create a serverless function. You can also try adding and deleting todos.
- Reload the page

Notice that it forgot your changes. That's because we're not yet saving them to a database (and not really loading them either). For that we'll need to create a second serverless function. But first, let's set up the database.

## Part Three: Couchbase

Reference: https://www.couchbase.com/blog/get-started-couchbase-capella

- Create or sign in to your account on [couchbase.com](https://www.couchbase.com/)
  - Choose Sign up with GitHub for easier integration

When you first create an account you will be guided through a quick start to set up a cluster. Your experience may vary but you can always make changes later in cluster settings. Here are the important steps:
  
- Click on Create Cluster
  - Choose the Free tier
    - Note: you can have one cluster at a time on the free tier
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

That was a lot of clicking but the important settings to keep track of are:
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
- In Contents of .env file, type your access credentials (it will look similar to the following)

~~~
COUCHBASE_ENDPOINT=cb.RANDOM_STRING.cloud.couchbase.com
COUCHBASE_BUCKET=todos
COUCHBASE_USERNAME=todos_user
COUCHBASE_PASSWORD=TODOS_PASSWORD
~~~

- Click Import variables



## Part Four: Local Development

This tutorial has shown that it is possible to develop and deploy a full-stack web app using only a web browser. Eventually you will want to do local development on your computer. Here are the basic steps.

- If necessary, install git: https://github.com/git-guides/install-git

## Part Five: Extra Credit

- GitLab, Bitbucket
- deploy from github to Vercel
- Data access layer and MongoDB, even MySQL
- https://docs.netlify.com/domains/configure-domains/bring-a-domain-to-netlify/


