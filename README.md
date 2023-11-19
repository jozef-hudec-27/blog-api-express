# Blog API

A simple [REST](https://en.wikipedia.org/wiki/REST) API for a blog. Contains routes to work with resources - posts and comments. Includes a [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) authentication system.

## Resource routes

Routes to manipulate resources. Comment routes omitted for brevity.

- **GET /posts** _(retrieve all posts)_
- **GET /posts/:postId** _(retrieve a single post)_
- **POST /posts** _(create a new post)_
- **PUT /posts/:postId** _(update a post)_
- **DELETE /posts/:postId** _(delete a post)_

_An example request to create a new post:_

`curl -X POST -H "Authorization: Bearer <your_access_token>" http://localhost:3000/api/posts -d "title=<post_title>&body=<post_body>"`

## Authentication routes

Routes to work with authentication tokens, both access and refresh tokens.

- **POST /register** _(create new user in DB)_
- **POST /login** _(issue access and refresh tokens)_
- **POST /refresh** _(refresh an access token using a refresh token)_
- **POST /logout** _(remove refresh token from DB)_

## Technologies used

- Express
- Mongoose
- bcrypt.js
- Passport.js
- JWT
