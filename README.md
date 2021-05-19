# Freemap v3

Next version of web portal maintained by [Slovak OpenStreetMap community](https://groups.google.com/forum/#!forum/osm_sk).

Features:

- maps rendered specifically for Slovakia (map of touristic trails, map of cycle routes and cross-country ski map)
- picture gallery
- various tools (searching, measurement, route planning, changesets, ...)

## Requirements

- Node 8
- [Freemap API Server](https://github.com/FreemapSlovakia/freemap-v3-nodejs-backend)

## Compiling and running in development mode

1. Add `local.freemap.sk` to `127.0.0.1` in your system hosts file (for Linux and MacOS it is `/etc/hosts`).

1. Install the necessary libs:

   ```bash
   npm i
   ```

1. Run webserver which also compiles the source files on change:

   ```bash
   npm start
   ```

1. Install [development CA certificate](./ssl/Freemap_CA.crt) to your browser.

1. Open the application by visiting `https://local.freemap.sk:9000/`.

## Compiling for the production

Set `DEPLOYMENT` to:

- `dev` (default) for `local.freemap.sk`
- `next` for `next.freemap.sk`
- `www` for `www.freemap.sk`

```bash
npm i
DEPLOYMENT=next ./node_modules/.bin/webpack
```

You'll then find all static web resources in `dist` directory.

## Other env varialbes

- FM_MAPSERVER_URL - base URL of Mapnik Mapserver (without trailing slash); for example `http://localhost:4000` for development
