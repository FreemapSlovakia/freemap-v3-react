# Freemap 3

Freemap Portal.

## Compiling and running in development mode

First compile the sources:

```
sudo npm i -g webpack
npm i
webpack --watch
```

Afterwards install and run http server (in separate console) to serve the compiled resources:

```
sudo npm i -g http-server
http-server dist
```

Finally open the application by visiting `http://localhost:8080/` (address printed by http-server command).

## Compiling for the production

```
sudo npm i -g webpack
npm i
NODE_ENV=production webpack
```
