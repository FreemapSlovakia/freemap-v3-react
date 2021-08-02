#!/bin/bash
set -e

rm -rf ../sitemap ../sitemap.tgz
mkdir ../sitemap

npx tsc ../src/osm/osmNameResolver.ts ../src/osm/osmTagToNameMapping-sk.ts --outDir .

node ./index.mjs

tar czf ../sitemap ../sitemap.tgz

echo Upload ../sitemap.tgz to the server and extract it to www/sitemap
