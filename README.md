# Freemap 3

Freemap Portal.

## Compiling and running in development mode

Install the necessary libs:

```
npm i
```

and run webserver which also compiles the source files on change:

```
npm run-script livereload
```

Then open the application by visiting `http://localhost:8080/` (address printed by `npm run-script livereload` command).

## Compiling for the production

```
npm i
NODE_ENV=production ./node_modules/.bin/webpack
```
