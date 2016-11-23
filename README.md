# libphonenumber-js

[![NPM Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]
[![Test Coverage][coveralls-badge]][coveralls]

A simpler (and smaller) rewrite of Google Android's famous `libphonenumber` library.

## LibPhoneNumber

`libphonenumber` is a phone number formatting a parsing library released by Google, originally developed for (and currently used in) Google's [Android](https://en.wikipedia.org/wiki/Android_(operating_system)) mobile phone operating system. Obviously, implementing a rigorous phone number formatting and parsing library was crucial for the phone OS overall usability (back then, in the early 2000s, it was originally meant to be a phone after all, not just a SnapChat device).

`libphonenumber-js` is a simplified javascript port of the original `libphonenumber` library (written in C++ and Java because those are the programming languages used in Android OS). While `libphonenumber` has an [official javascript port](https://github.com/googlei18n/libphonenumber/tree/master/javascript) which is being maintained by Google, it is tightly coupled to Google's `closure` javascript utility framework. It still can be compiled into [one big bundle](http://stackoverflow.com/questions/18678031/how-to-host-the-google-libphonenumber-locally/) which weighs 220 KiloBytes — quite a size for a phone number input component.

One part of me was curious about how all this phone matching machinery worked, and another part of me was curious if there's a way to reduce those 220 KiloBytes to something more reasonable while also getting rid of the `closure` library and rewrite it in pure javascript. So, that was my little hackathon for a couple of weeks, and seems that it succeeded. The resulting library does everything a modern web application needs while maintaining a much slimmer size of about 70 KiloBytes.

## Installation

```
# not yet finished therefore not yet published to npm
npm install libphonenumber-js --save
```

## Usage

```js
import { parse } from 'libphonenumber-js'

parse('8 (800) 555 35 35', 'RU') === { country: 'RU', phone: '8005553535' }
```

## API

### parse(text, options)

`options` can be

```js
country:
{
  restrict — (a two-letter country code)
             assume the phone number is for this country

  default — (a two-letter country code)
            default country to use for phone number parsing and validation
            (if no country code could be derived from the phone number)
}
```

or just a two-letter country code which is gonna be `country.restrict`.

Returns `{ country, phone }` where `country` is a two-letter country code, and `phone` is a national (significant) number.

## Contributing

After cloning this repo, ensure dependencies are installed by running:

```sh
npm install
```

This module is written in ES6 and uses [Babel](http://babeljs.io/) for ES5
transpilation. Widely consumable JavaScript can be produced by running:

```sh
npm run build
```

Once `npm run build` has run, you may `import` or `require()` directly from
node.

After developing, the full test suite can be evaluated by running:

```sh
npm test
```

When you're ready to test your new functionality on a real project, you can run

```sh
npm pack
```

It will `build`, `test` and then create a `.tgz` archive which you can then install in your project folder

```sh
npm install [module name with version].tar.gz
```

## License

[MIT](LICENSE)
[npm]: https://www.npmjs.org/package/libphonenumber-js
[npm-badge]: https://img.shields.io/npm/v/libphonenumber-js.svg?style=flat-square
[travis]: https://travis-ci.org/halt-hammerzeit/libphonenumber-js
[travis-badge]: https://img.shields.io/travis/halt-hammerzeit/libphonenumber-js/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/halt-hammerzeit/libphonenumber-js?branch=master
[coveralls-badge]: https://img.shields.io/coveralls/halt-hammerzeit/libphonenumber-js/master.svg?style=flat-square
