# Freemap Slovakia Web Application

Current version of [www.freemap.sk](https://www.freemap.sk) maintained by [OZ Freemap Slovakia](https://oz.freemap.sk).

## Requirements

- Node 14
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
DEPLOYMENT=www ./node_modules/.bin/webpack
```

You'll then find all static web resources in `dist` directory.

## Other env varialbes

- `FM_MAPSERVER_URL` - base URL of Mapnik Mapserver (without trailing slash); for example `http://localhost:4000` for development

## Translation (i18n)

Files:

- [webpack.config.js](webpack.config.js) - texts in `htmlPluginProps`
- [src/translations/en-shared.json](src/translations/en-shared.json)
- [src/translations/en.tsx](src/translations/en.tsx)
- [src/components/supportUsModal/translations/en.tsx](src/components/supportUsModal/translations/en.tsx)
- [src/globalErrorHandler.ts](src/globalErrorHandler.ts) - bottom error message
- [src/osm/osmTagToNameMapping-en.ts](src/osm/osmTagToNameMapping-en.ts)
- https://github.com/FreemapSlovakia/freemap-mapnik/blob/develop/legend.js
