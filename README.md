# libphonenumber-js

[![npm version](https://img.shields.io/npm/v/libphonenumber-js.svg?style=flat-square)](https://www.npmjs.com/package/libphonenumber-js)
[![npm downloads](https://img.shields.io/npm/dm/libphonenumber-js.svg?style=flat-square)](https://www.npmjs.com/package/libphonenumber-js)
[![coverage](https://img.shields.io/coveralls/catamphetamine/libphonenumber-js/master.svg?style=flat-square)](https://coveralls.io/r/catamphetamine/libphonenumber-js?branch=master)

A simpler (and smaller) rewrite of Google Android's famous `libphonenumber` library: easy phone number parsing and formatting in javascript.

[See Demo](https://catamphetamine.github.io/libphonenumber-js/)

## LibPhoneNumber

[`libphonenumber`](https://github.com/googlei18n/libphonenumber) is a phone number formatting and parsing library released by Google, originally developed for (and currently used in) Google's [Android](https://en.wikipedia.org/wiki/Android_(operating_system)) mobile phone operating system. Implementing a rigorous phone number formatting and parsing library was crucial for the phone OS overall usability (back then, in the early 2000s, it was originally meant to be a phone after all, not just a SnapChat device).

`libphonenumber-js` is a simplified pure javascript port of the original `libphonenumber` library (written in C++ and Java because those are the programming languages used in Android OS). While `libphonenumber` has an [official javascript port](https://github.com/googlei18n/libphonenumber/tree/master/javascript) which is being maintained by Google, it is tightly coupled to Google's `closure` javascript utility framework. It still can be compiled into [one big bundle](http://stackoverflow.com/questions/18678031/how-to-host-the-google-libphonenumber-locally/) which weighs 220 KiloBytes — quite a size for a phone number input component. It [can be reduced](https://github.com/leodido/i18n.phonenumbers.js) to a specific set of countries only but that wouldn't be an option for a worldwide international solution.

One part of me was curious about how all this phone matching machinery worked, and another part of me was curious if there's a way to reduce those 220 KiloBytes to something more reasonable while also getting rid of the `closure` library and rewriting it all in pure javascript. So, that was my little hackathon for a couple of weeks, and seems that it succeeded. The resulting library does everything a modern web application needs while maintaining a much smaller size of about 75 KiloBytes.

## Difference from Google's `libphonenumber`

  * Pure javascript, doesn't require any 3rd party libraries
  * Metadata size is just about 75 KiloBytes while the original `libphonenumber` metadata size is about 200 KiloBytes
  * Better "as you type" formatting (and also more iPhone-alike style)
  * Doesn't parse alphabetic phone numbers like `1-800-GOT-MILK` as we don't use telephone sets in the XXIst century that much (and we have phonebooks in your mobile phones)
  * Doesn't handle carrier codes: they're only used in Colombia and Brazil, and only when dialing within those countries from a mobile phone to a fixed line number (the locals surely already know those carrier codes by themselves)
  * Assumes all phone numbers being `format`ted are internationally diallable, because that's the only type of phone numbers users are supposed to be inputting on websites (no one inputs short codes, emergency telephone numbers like `911`, etc.)
  * Doesn't parse phone numbers with extensions (again, this is not the type of phone numbers users should input on websites — they're supposed to input their personal mobile phone numbers, or home stationary phone numbers if they're living in an area where celltowers don't have a good signal, not their business/enterprise stationary phone numbers)
  * Doesn't use `possibleDigits` data to speed up phone number pre-validation (it just skips to the regular expression check itself)
  * Doesn't distinguish between fixed line, mobile, pager, voicemail, toll free and other XXth century bullsh*t
  * Doesn't format phone numbers for "out of country dialing", e.g. `011 ...` in the US (again, just use the `+...` notation accepted worldwide for mobile phones)
  * Doesn't parse `tel:...` URIs ([RFC 3966](https://www.ietf.org/rfc/rfc3966.txt)) because it's not relevant for user-facing web experience
  * When formatting international numbers replaces all braces, dashes, etc with spaces (because that's the logical thing to do, and leaving braces in an international number isn't)

## Installation

```
npm install libphonenumber-js --save
```

## Usage

```js
import { parse, format, asYouType } from 'libphonenumber-js'

parse('8 (800) 555 35 35', 'RU')
// { country: 'RU', phone: '8005553535' }

format('2133734253', 'US', 'International')
// '+1-213-373-4253'

new asYouType().input('+12133734')
// '+1 213 373 4'
new asYouType('US').input('2133734')
// '(213) 373-4'
```

## Country code definition

"Country code" means either a [two-letter ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (like `US`) or a special `001` country code used for non-geographical entities (as per [Google's libphonenumber library](https://github.com/googlei18n/libphonenumber/blob/0068d861a68d3d4612f7bf8646ab844dd3cefce5/java/libphonenumber/test/com/google/i18n/phonenumbers/RegionCode.java#L23-L24)). For example, `+7 800 555 35 35` phone number belongs to Russia so it has `RU` country code where as `+800 1 1111 1111` phone number could belong to any country so it has `001` country code.

## API

### parse(text, options)

`options` can be either an object

```js
country:
{
  restrict — (country code)
             the phone number must be in this country

  default — (country code)
            default country to use for phone number parsing and validation
            (if no country code could be derived from the phone number)
}
```

or just a [country code](https://github.com/catamphetamine/libphonenumber-js#country-code-definition) which is gonna be `country.restrict`.

Returns `{ country, phone }` where
 * `country` is a [country code](https://github.com/catamphetamine/libphonenumber-js#country-code-definition)
 * `phone` is a national (significant) number

If the phone number supplied isn't valid then an empty object `{}` is returned.

```js
parse('+1-213-373-4253') === { country: 'US', phone: '2133734253' }
parse('(213) 373-4253', 'US') === { country: 'US', phone: '2133734253' }
```

### format(parsed_number, format)

Formats a phone number using one of the following `format`s:
  * `International` — e.g. `+1 213 373 4253`
  * `International_plaintext` — (aka [`E.164`](https://en.wikipedia.org/wiki/E.164)) e.g. `+12133734253`
  * `National` — e.g. `(213) 373-4253`

`parsed_number` argument **must** be an already `parse()`d phone number (to strip national prefix from it). That means that first a phone number is `parse()`d and only then is it `format()`ted and there's no other way around it. For example, a phone number is `parse()`d before storing it in a database and then it is `forrmat()`ted each time it is read from the database. The `parsed_number` object argument can also be expanded into two string arguments (for those who prefer this kind of syntax):

```js
format({ country: 'US', phone: '2133734253' }, 'International') === '+1 213 373 4253'
format('2133734253', 'US', 'International') === '+1 213 373 4253'

// The following won't work becase the phone number argument is invalid
// (has not been parsed previously and therefore contains the `0` national prefix)
format('017212345678', 'DE', 'International_plaintext') !== '+4917212345678'
```

### getNumberType(parsed_number)

Determines phone number type (fixed line, mobile, toll free, etc). This function will work if `--extended` (or relevant `--types`) metadata is available (see [Metadata](#metadata) section of this document). The regular expressions used to differentiate between various phone number types consume a lot of space (two thirds of the total size of the `--extended` library build) therefore they're not included in the bundle by default.

The arguments can be

 * either the result of the `parse()` function call: `{ country, phone }`
 * or a pair of arguments `(phone, country_code)` in which case it is passed to the `parse()` function right away and the resulting `{ country, phone }` object is used

```js
getNumberType('8005553535', 'RU') === 'MOBILE'
```

### isValidNumber(parsed_number)

(aka `is_valid_number`)

Checks if a phone number is valid.

The arguments can be

 * either the result of the `parse()` function call: `{ country, phone }`
 * or a pair of arguments `(phone, country_code)` in which case it is passed to the `parse()` function right away and the resulting `{ country, phone }` object is used

```js
isValidNumber('+1-213-373-4253') === true
isValidNumber('+1-213-373') === false

isValidNumber('(213) 373-4253', 'US') === true
isValidNumber('(213) 37', 'US') === false

isValidNumber({ phone: '2133734253', country: 'US' }) === true
```

The difference between using `parse()` and `isValidNumber()` for phone number validation is that `isValidNumber()` also checks the precise regular expressions of possible phone numbers for a country. For example, for Germany `parse('123456', 'DE')` would return `{ country: 'DE', phone: '123456' }` because this phone number matches the general phone number rules for Germany. But, if the metadata is compiled with `--extended` (or relevant `--types`) flag (see below) and the precise regular expressions for possible phone numbers are included in the metadata then `isValidNumber()` is gonna use those precise regular expressions for validation and `isValid('123456', 'DE')` will return `false` because the phone number `123456` doesn't actually exist in Germany.

So, the general phone number rules for a country are mainly for phone number formatting: they dictate how different phone numbers (matching those general regular expressions) should be formatted. And `parse()` uses only those general regular expressions (as per the reference Google's `libphonenumber` implementation) to perform basic phone number validation. `isValidNumber()`, on the other hand, is all about validation, so it digs deeper into precise regular expressions (if they're included in metadata) for possible phone numbers in a given country. And that's the difference between them: `parse()` parses phone numbers and loosely validates them while `isValidNumber()` validates phone number precisely (provided the precise regular expressions are included in metadata).

By default those precise regular expressions aren't included in metadata at all because that would cause metadata to grow twice in its size (the complete metadata would be about 200 KiloBytes). If anyone needs to generate custom metadata then it's very easy to do so: just follow the instructions provided in the [Customizing metadata](#customizing-metadata) section of this document (the option to look for is `--extended`, or relevant `--types`).

### `class` asYouType(default_country_code)

(aka `as_you_type`)

Creates a formatter for partially entered phone number. The two-letter `default_country_code` is optional and, if specified, is gonna be the default country for the phone number being input (in case it's not an international one). The instance of this class has two methods:

 * `input(text)` — takes any text and appends it to the input; returns the formatted phone number
 * `reset()` — resets the input

The instance of this class has also these fields:

<!-- * `valid` — is the phone number being input a valid one already
formatter.valid === true -->
 * `country` — a [country code](https://github.com/catamphetamine/libphonenumber-js#country-code-definition) of the country this phone belongs to
 * `country_phone_code` — a phone code of the `country`
 * `national_number` — national number part (so far)
 * `template` — currently used phone number formatting template, where digits (and the plus sign, if present) are denoted by `x`-es

```js
new asYouType().input('+12133734') === '+1 213 373 4'
new asYouType('US').input('2133734') === '(213) 373-4'

const formatter = new asYouType()
formatter.input('+1-213-373-4253') === '+1 213 373 4253'
formatter.country === 'US'
formatter.country_phone_code = '1'
formatter.template === 'xx xxx xxx xxxx'
```

### getPhoneCode(country_code)

There have been requests for a function returning a phone code by country code.

```js
getPhoneCode('RU') === '7'
getPhoneCode('IL') === '972'
```

## Metadata

Metadata is generated from Google's original [`PhoneNumberMetadata.xml`](https://github.com/googlei18n/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml) by transforming XML into JSON and removing unnecessary fields.

Currently I have an npm script for monitoring changes to `PhoneNumberMetadata.xml` in Google's repo and automatically creating a Pull Request in this repo with the fresh metadata when it is updated. What's left is to test this script and schedule it to run daily on my machine. So this project's metadata is supposed to be up-to-date. Still, in case the automatic metadata update script malfunctions some day, anyone can request metadata update via a Pull Request here on GitHub:

  * Fork this repo
  * `npm install`
  * `npm run metadata:update`
  * Submit a Pull Request to this repo from the `update-metadata` branch of your fork

`npm run metadata:update` command creates a new `update-metadata` branch, downloads the new [`PhoneNumberMetadata.xml`](https://github.com/googlei18n/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml) into the project folder replacing the old one, generates JSON metadata out of the XML one, checks if the metadata has changed, runs the tests, commits the new metadata and pushes the commit to the remote `update-metadata` branch of your fork.

Alternatively, a developer may wish to update metadata urgently, without waiting for a pull request approval. In this case just perform the steps described in the [Customizing metadata](#customizing-metadata) section of this document.

## React

There's also a React component utilizing this library: [`react-phone-number-input`](https://github.com/catamphetamine/react-phone-number-input)

<!-- ## To do

Everything's done -->

## Bug reporting

If any inconsistencies with the [original Google's `libphonenumber`](https://libphonenumber.appspot.com/) are found then an issue can be reported in this repo.

Phone number validation bugs should **only** be reported if they appear when using [custom metadata functions](#customizing-metadata) fed with `metadata.full.json` because by default all functions in this library use the reduced metadata set which results in looser validation than the original Google `libphonenumber`'s. The [demo page](https://catamphetamine.github.io/libphonenumber-js/) also uses the reduced metadata set and therefore its validation is also looser than the original Google `libphonenumber`'s. That being said, it's very unlikely that any phone number validation inconsistencies could even exist. This paragraph is here just to prevent people from reporting "validation inconsistency" issues.

## Webpack

If you're using Webpack 1 (which you most likely are) then make sure that

 * You have `json-loader` set up for `*.json` files in Webpack configuration (Webpack 2 has `json-loader` set up by default)
 * `json-loader` doesn't `exclude` `/node_modules/`
 * If you override `resolve.extensions` in Webpack configuration then make sure `.json` extension is present in the list

Webpack 2 sets up `json-loader` by default so there's no need for any special configuration. So better upgrade to Webpack 2 instead.

## Standalone

For those who aren't using bundlers for some reason there's a way to build a standalone version of the library

 * `git clone https://github.com/catamphetamine/libphonenumber-js.git`
 * `npm install`
 * `npm run browser-build`
 * See the `bundle` folder for `libphonenumber-js.min.js`

```html
<script src="/scripts/libphonenumber-js.min.js"></script>
<script>
  alert(new libphonenumber.asYouType('US').input('213-373-4253'))
</script>
```

## Customizing metadata

This library comes prepackaged with three flavours of metadata

* `metadata.full.json` — contains everything, including all regular expressions for precise phone number validation and getting phone number type, but weighs `130 KiloBytes`.
* `metadata.min.json` — (default) the minimal one, doesn't contain regular expressions for precise phone number validation and getting phone number type, weighs `70 KiloBytes`.
* `metadata.mobile.json` — contains regular expressions for precise **mobile** phone number validation, weighs `100 KiloBytes`.

Furthermore, if only a specific set of countries is needed in a project, and a developer really wants to reduce the resulting bundle size, say, by 50 KiloBytes (even when including all regular expressions for precise phone number validation and getting phone number type), then he can generate such custom metadata and pass it as an extra argument to this library's functions.

First, add metadata generation script to **your project's** `package.json`

```js
{
  "scripts": {
    "libphonenumber-metadata": "libphonenumber-generate-metadata metadata.min.json --countries RU,DE --extended",
  }
}
```

And then run it like `npm run libphonenumber-metadata`.

The arguments are

* The first argument is the output metadata file path.
* `--countries` argument is a comma-separated list of the countries included (if `--countries` is omitted then all countries are included).
* `--extended` argument may be passed to include all regular expressions for precise phone number validation and getting phone number type, which increases the precision of phone number validation but at the same time it will enlarge the resulting metadata size approximately twice.
* `--types ...` argument may be passed instead of `--extended` to only include the precise phone number type regular expressions for a specific set of phone number types (a comma-separated list, e.g. `--types mobile,fixed`).

Then use the generated `metadata.min.json` with the exported "custom" functions.

For a "tree-shaking" ES6-capable bundler (e.g. Webpack 2) that would be

```js
import { parseCustom, formatCustom, isValidNumberCustom, asYouTypeCustom } from 'libphonenumber-js'
import metadata from './metadata.min.json'

export const parse = (...args) => parseCustom(...args, metadata)
export const format = (...args) => formatCustom(...args, metadata)
export const isValidNumber = (...args) => isValidNumberCustom(...args, metadata)

export class asYouType extends asYouTypeCustom {
  constructor(country) {
    super(country, metadata)
  }
}
```

And for [Common.js](https://auth0.com/blog/javascript-module-systems-showdown/) environment that would be

```js
var custom = require('libphonenumber-js/custom')
var metadata = require('./metadata.min.json')

exports.parse = function parse() {
  var parameters = Array.prototype.slice.call(arguments)
  parameters.push(metadata)
  return custom.parse.apply(this, parameters)
}

exports.format = function format() {
  var parameters = Array.prototype.slice.call(arguments)
  parameters.push(metadata)
  return custom.format.apply(this, parameters)
}

exports.isValidNumber = function isValidNumber() {
  var parameters = Array.prototype.slice.call(arguments)
  parameters.push(metadata)
  return custom.isValidNumber.apply(this, parameters)
}

exports.asYouType = function asYouType(country) {
  custom.asYouType.call(this, country, metadata)
}

exports.asYouType.prototype = Object.create(custom.asYouType.prototype, {})
exports.asYouType.prototype.constructor = exports.asYouType

```

ES6 "tree-shaking" is a non-trivial thing and at the moment of writing it's not guaranteed that a given ES6-aware bundler will actually be intelligent enough to tree-shake unused code, so there's always another option for those cases (if they arise): using `libphonenumber-js/custom` [Common.js](https://auth0.com/blog/javascript-module-systems-showdown/) export.

```js
import { parse as parseCustom } from 'libphonenumber-js/custom'
import metadata from './metadata.min.json'

export const parse = (...args) => parseCustom(...args, metadata)
```

<!-- ## To do -->

<!--
## Automatic metadata update setup

A daily (24 * 60 * 60) `launchd` job

http://alvinalexander.com/mac-os-x/mac-osx-startup-crontab-launchd-jobs

```sh
mkdir /Users/kuchumovn/work/libphonenumber-js-autoupdate

git clone https://github.com/catamphetamine/libphonenumber-js.git /Users/kuchumovn/work/libphonenumber-js-autoupdate

cd /Users/kuchumovn/work/libphonenumber-js-autoupdate

npm install

chmod u+x /Users/kuchumovn/work/libphonenumber-js-autoupdate/autoupdate.sh

nano ~/Library/LaunchAgents/com.github.catamphetamine.libphonenumber-js.metadata-update.plist

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.github.catamphetamine.libphonenumber-js.metadata-update</string>

    <key>ProgramArguments</key>
    <array>
      <string>/Users/kuchumovn/work/libphonenumber-js-autoupdate/autoupdate.sh</string>
    </array>

    <key>Nice</key>
    <integer>1</integer>

    <key>StartInterval</key>
    <integer>86400</integer>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardErrorPath</key>
    <string>/tmp/libphonenumber.errors.txt</string>

    <key>StandardOutPath</key>
    <string>/tmp/libphonenumber.output.txt</string>
  </dict>
</plist>

launchctl load ~/Library/LaunchAgents/com.github.catamphetamine.libphonenumber-js.metadata-update.plist

launchctl list | grep 'libphonenumber-js'
```
-->

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
