#!/bin/bash

DATE=$(date +%Y%m%d-%H%M)
FILENAME=ttt-$DATE
FILE_PATH=./artifact/$FILENAME.zip 

npm run build
zip -r $FILE_PATH ./build

echo $FILE_PATH