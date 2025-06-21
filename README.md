# serverless-tutorial

Learn how to develop a full-stack web app using only a web browser, and host it in the cloud for free

This tutorial will show you how to:
- Create a client-side web app using HTML and JavaScript, hosted on GitHub.com
- Add serverless functions for database connectivity and deploy your app to Netlify.com
- Store your web app data in the cloud with Couchbase.com

## Prologue

To get started, let's create a static web page and host it on GitHub.com

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

## Part 1 - GitHub

Now let's turn that static web page into a dynamic web app using JavaScript

Reference: https://www.taniarascia.com/javascript-mvc-todo-app

- Begin by updating index.html with the following content
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
- Click Add file, name it style.css, paste the content from the following link, and click Commit changes
  - https://github.com/taniarascia/mvc/blob/master/style.css
- Click Add file, name it script.js, paste the content from the following link, and click Commit changes
  - https://github.com/taniarascia/mvc/blob/master/script.js
  - Note: feel free to follow along with that tutorial and build up script.js one step at a time
- View your updated web app at: https://*username*.github.io
  - Remember that it may take a few seconds for committed changes to be deployed to your live site.
  - When editing JavaScript, you may need to force reload the page to see the latest changes.

## Part 2 - Netlify

deploy site as-is to netlify

## Part 3 - Couchbase

set up couchbase and add serverless functions

## Part 4 - Local development

This tutorial has shown that it is possible to develop a full-stack web app using only a web browser. Eventually you will want to do local development on your computer. Here are the basic steps.

- If necessary, install git: https://github.com/git-guides/install-git

## Epilogue

deploy from github to Vercel
Data access layer and MongoDB


