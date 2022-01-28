# Node ES Modules Support

These are some notes on potentially implementing Node.js's native EcmaScript Modules support.

## Why

It originally started with a non-reproducible [issue report](https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/42).

Turns out, Node.js 14+ introduced native support for `import` syntax, but did it in its own weird way. The native support for `import` syntax can be turned on by adding `type: "module"` flag in the application's `package.json` or by using `*.mjs` file extension. It also imposes a needless and stupid requirement to always specify the file extension when `import`ing from relative paths.

<!--
Turns out, Node.js 14+ introduced native support for `import` syntax, but did it in its own weird incompatible way. The native support for `import` syntax can be turned on by adding `type: "module"` flag in the application's `package.json` or by using `*.mjs` file extension, but that also breaks "named exports" when importing from "legacy" packages — ones that neither use the `type: "module"` flag in their `package.json`, nor the `*.mjs` file extension.

As a workaround, "named exports" can still be accessed from the `default` export, but that would look a bit hacky, and would also only work exclusively in Node.js 14+, and won't cross-compile between server side and client side when writing "isomorphic" code because on client side the `default` export won't contain any of the "named exports".

As another workaround, one could create a file

In order to fix that incompatibility, the library would have to include a separate build just for this new Node.js module subsystem.
-->

## Status

The solution is outlined below, but I have decided not to add it to the library for now because it seems too convoluted. The new ES Modules feature in Node.js has several weird and needless restrictions that overcomplicate the whole process of making 3rd-party libraries compatible. Among those restrictions, requiring a developer to specify an explicit file extension on all relative imports is especially stupid.

Even if someone decides to implement all this and submit a pull request, I don't think that it would get merged because it's still convoluted. Node.js developers should come up with a better designed ES Module importing system.

## Solution

First, add the entries from `exports/package.json` file to `package.json` file.

Then, the following steps should be added to the `build` script in `package.json`:

* Delete `exports/build` and `exports/es6` folders, if those exist.

* Copy `build` and `es6` folders to `exports` folder.

* In every file in `build` and `es6` folders (recursively), modify all `import`s by appending `.js` to all file paths.

* Create a "dummy" `exports/build/package.json` file just so it overrides the `type: "module"` import flag defined in `package.json` file.

```js
{
  "private": true,
  "name": "libphonenumber-js/commonjs",
  "version": "1.0.0",
  "main": "../min/commonjs/index.js"
}
```

* Copy `types.d.ts` file to `exports/types.d.ts`.

* For each of the: `min`, `mobile`, `max`, `full`, `core`.

  * Copy `min/metadata.js` and `min/index.js` files and `min/exports/` folder to `exports/min`.
  * In `exports/min/metadata.js` file, modify the import path to be `'../metadata.min.json/index.js'`.
  * In `exports/min/index.js` file, modify all `export`s by appending `.js` to all file paths.
  * In every file in `exports/min/exports` folder, modify all `import`s by appending `.js` to all file paths.
  * Copy `min/commonjs.js` file to `exports/min/index.cjs`.
  * In `exports/min/index.cjs` file, modify all `import`s by appending `.js` to all file paths. Also change `../core/index.commonjs` path to `../../core/index.cjs`, and `../metadata.min.json` path to `../../metadata.min.json/index.cjs`.

* For each of the: `min`, `core`.

  * Copy `min/index.d.ts` file to `exports/min/index.d.ts`.
  * In `exports/min/index.d.ts`, add `.d.ts` to all imported file paths.

* For each of the: `min`, `mobile`, `max`, `full`.

  * Copy `metadata.min.json.js` file to `exports/metadata.min.json/index.cjs`.
  * In `exports/metadata.min.json/index.cjs` file, replace `export default` with `exports = module.exports =`.
  * Copy `metadata.mobile.json.d.ts` file to `exports/metadata.mobile.json/index.d.ts`.
  * In `exports/metadata.mobile.json/index.d.ts`, add `.d.ts` to all imported file paths.

* For `mobile`.

  * Copy `examples.mobile.json.js` file to `exports/examples.mobile.json/index.cjs`.
  * In `exports/examples.mobile.json/index.cjs` file, replace `export default` with `exports = module.exports =`.
  * Copy `examples.mobile.json.d.ts` file to `exports/examples.mobile.json/index.d.ts`.
  * In `exports/examples.mobile.json/index.d.ts`, add `.d.ts` to all imported file paths.

## Testing

Test if it works in:

* Node.js before version 12.
* Node.js 12+.
* Webpack 5.
* Webpack 6.
* TypeScript — See if it finds the "typings" for those `exports` entries when `import`ing from `libphonenumber-js/min`, etc.
  * Without `"compilerOptions": { "module": "nodenext" }` config.
  * With `"compilerOptions": { "module": "nodenext" }` config.

## References

[Node.js EcmaScript Modules](https://nodejs.org/api/packages.html)

[TypeScript support](https://www.typescriptlang.org/docs/handbook/esm-node.html)

[Using `esm` package instead of `type: "module"` to support `import` syntax in Node.js](https://www.npmjs.com/package/esm)