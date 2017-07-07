# Freemap v3

Latest version of web portal maintained by [Slovak OpenStreetMap community](https://groups.google.com/forum/#!forum/osm_sk). Provides access to maps rendered specifically for Slovakia, e.g., map of touristic trails, map of cycle routes and (cross-country) skiing map.

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
