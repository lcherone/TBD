# Nuxt.js + Express + JWT + Socket.io + Vuetify

**WIP:** - Not ready for human consumption...

A [Nuxt.js](https://github.com/nuxt/nuxt.js) starter project template which includes the following:

 - Vuetify with local material icons and roboto fonts
 - Babel-polyfill added
 - Express ES6 style MVC structure
 - Express server middleware for JWT authentication
 - Client/Server JWT store handling for protected axios calls 
 - Certificate based short expiry JWT's with auto refresh, inc socket.io tokens
 - Helper scripts for installing db, inport/export db, install and run php inbuilt server for Adminer
 - Example API routes, auth and users
 - Login page with validation and error display
 - Example plugins (storage, prompt, hashid, debounce, breadcrumbs, alerts)
 - Plus much more

## Prerequisites

Make sure to have `node 8.0+` and `npm 5.0+` installed

## Installation

This is a project template for [vue-cli](https://github.com/vuejs/vue-cli).

``` bash
$ vue init lcherone/{TBD} my-project  
$ cd my-project                     
# install dependencies
$ npm install
# re-generate JWT certs
$ npm run generate-jwt-certs
```

Edit `.env` to suit your db setup.

> Make sure to use a version of vue-cli >= 2.1 (`vue -V`).

## Usage

### Development

``` bash
# serve with hot reloading at localhost:3000
$ npm run dev
```

Go to [http://localhost:3000](http://localhost:3000)

### Production

``` bash
# build for production and launch the server
$ npm run build
$ npm start
```
