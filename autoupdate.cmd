:: Set the current folder to the script's folder.
pushd %~dp0
:: Update dependencies (so that it doesn't throw "module not found").
npm install
:: Update metadata and release the new version.
npm run metadata:update:job
:: Restore the previous current folder.
popd
