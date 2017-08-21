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

### Connecting to osm.org auth in dev env

In order to successfully login via openstreetmap.org auth from the web app:

1. add `127.0.0.1      local.freemap.sk` to `/etc/hosts`
2. in browser, go to url `http://local.freemap.sk:8080/`
3. click on "Prihlasenie" in menu 

This procedure is meant to proceed successfully with default CORS policy (no bypass-cors plugin in required).

## Compiling for the production

```
npm i
NODE_ENV=production ./node_modules/.bin/webpack
```
