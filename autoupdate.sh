#!/bin/sh

export PATH=/usr/local/bin:$PATH
cd /Users/kuchumovn/work/libphonenumber-js
npm run metadata:update
npm run metadata:pull-request