# serverless-tutorial

Learn how to develop a full-stack web app using only a web browser, and host it in the cloud for free

This tutorial will show you how to:
- Create a client-side web app using HTML and JavaScript, hosted on GitHub
- Add serverless functions for database connectivity and deploy your app to Netlify
- Store your web app data in the cloud with Couchbase

## Part One - GitHub

To get started, let's create a static web page and host it on GitHub

Reference: https://pages.github.com/

- If necessary, create an account on GitHub.com
- Create a new public repository named *username*.github.io
- In your new repository, click Add file
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
- Open a new browser tab and go to: https://*username*.github.io

At this point you may choose to experiment with adding and updating pages in your repo on GitHub.com. As you commit changes they should automatically be deployed to your live web site.

---

Now let's turn that static web page into a dynamic web app using JavaScript

Reference: https://www.taniarascia.com/javascript-mvc-todo-app

- In the repo you created, select index.html, click the pencil to Edit this file, and replace the original Hello World example with the following content
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
- View your updated web app at: https://*username*.github.io
  - Remember that it may take a few seconds for committed changes to be deployed to your live site
  - When editing JavaScript, you may need to force reload the page to see the latest changes
 
This client-side web app uses localStorage to persist the app state across sessions within the same browser. To persist data across devices, we'll need a database.

## Part Two - Netlify

With traditional [LAMP](https://en.wikipedia.org/wiki/LAMP_(software_bundle)) development, our web app would call PHP functions running on a server to access a MySQL database. In many cases the client-side HTML and JavaScript files would be served from the same host that is also running the PHP and MySQL. With serverless functions, we'll replace the PHP with Node.js (one of many choices) that connects to a Couchbase database (again, one of many choices). Netlify takes care of running the functions, so we don't need to maintain a server.

Reference: https://developer.couchbase.com/tutorial-quickstart-netlify/

First we'll deploy our web app from GitHub to Netlify and make sure it still works as-is.

- If necessary, create an account on Netlify.com
  - Choose Sign up with GitHub for easier integration
  - Select the Free tier
- Click Add new project > Import an existing project
- Click GitHub
- Select the *username*.github.io repo
- Leave all the default settings and click Deploy *username*.github.io
- Click the link to open https://*random-project-name*.netlify.app

You now have two separate instances of your application running on github.io and netlify.app.

Before going on, let's see what happens when we make a small change to the app.

- In GitHub, edit script.js and change the following line from:
  
    `this.title.textContent = 'Todos'`
  
- To:

  `this.title.textContent = 'Todo List'`

- Click Commit changes
- View your updated web app at: https://*username*.github.io
  - Remember you might need to force reload to see the change
- Also view your updated web app at: https://*random-project-name*.netlify.app

Both GitHub and Netlify automatically redeployed the app based on the new commit.

---

Next

## Part Three - Couchbase

set up couchbase and add serverless functions

## Part Four - Local Development

This tutorial has shown that it is possible to develop and deploy a full-stack web app using only a web browser. Eventually you will want to do local development on your computer. Here are the basic steps.

- If necessary, install git: https://github.com/git-guides/install-git

## Part Five - Extra Credit

- GitLab, Bitbucket
- deploy from github to Vercel
- Data access layer and MongoDB, even MySQL


