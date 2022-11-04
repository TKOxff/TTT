#!/bin/bash

# jq install required
VERSION=$(jq -r .version ./public/manifest.json)
# echo $VERSION
DATE=$(date +%H%M)
FILENAME=ttt-v$VERSION-r$DATE

FILE_PATH=./artifact/$FILENAME.zip 

npm run build
zip -r $FILE_PATH ./build

echo $FILE_PATH