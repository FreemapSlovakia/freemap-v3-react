# Toposcope Maker

Web app for making toposcopes.

## Compiling and running in the dev mode
```
sudo npm i -g webpack
npm i
webpack --config webpack-app.config.js --watch
# for library: webpack --config webpack-library.config.js --watch
```

## Compiling for the production

```
sudo npm i -g webpack
npm i
NODE_ENV=production webpack --config webpack-app.config.js
NODE_ENV=production webpack --config webpack-library.config.js
```

## Library

If compiled with `webpack-library.config.js` then you can include toposcope as a library to your code with `<script src="build/library.js"></script>`.
See `library-demo.html` for reference usage.
