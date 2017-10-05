# Freemap v3

Next version of web portal maintained by [Slovak OpenStreetMap community](https://groups.google.com/forum/#!forum/osm_sk).

Features:

* maps rendered specifically for Slovakia (map of touristic trails, map of cycle routes and cross-country skiing map)
* picture gallery
* various tools (searching, measurement, route planning, changesets, ...)

Note that the protal is (so far) only in Slovak language.

## Requirements

* Node 8
* [Freemap API Server](https://github.com/FreemapSlovakia/freemap-v3-nodejs-backend)

## Compiling and running in development mode

1. Add `local.freemap.sk` to `127.0.0.1` in your system hosts file (for Linux and MacOS it is `/etc/hosts`).

1. Install the necessary libs:

    ```bash
    npm i
    ```

1. Run webserver which also compiles the source files on change:

    ```bash
    npm run livereload
    ```

1. Open the application by visiting `http://local.freemap.sk:9000/`.

## Compiling for the production

```bash
npm i
NODE_ENV=production ./node_modules/.bin/webpack
```

You'll then find all static web resources in `dist` directory.
