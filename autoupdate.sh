#!/bin/sh

export PATH=/usr/local/bin:$PATH

# Enter this script's folder
cd "${0%/*}"

npm run metadata:update
npm run metadata:pull-request