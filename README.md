# Freemap 3

Freemap Portal.

## Compiling and running in the dev mode
```
sudo npm i -g webpack
npm i
webpack --watch
```

then run in `dist` folder a static webserver, e.g. `ruby -run -ehttpd . -p8000` and go to `http://localhost:8000/`

## Compiling for the production

```
sudo npm i -g webpack
npm i
NODE_ENV=production webpack
```
