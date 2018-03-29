# libphonenumber-js

[![npm version](https://img.shields.io/npm/v/libphonenumber-js.svg?style=flat-square)](https://www.npmjs.com/package/libphonenumber-js)
[![npm downloads](https://img.shields.io/npm/dm/libphonenumber-js.svg?style=flat-square)](https://www.npmjs.com/package/libphonenumber-js)
[![coverage](https://img.shields.io/coveralls/catamphetamine/libphonenumber-js/master.svg?style=flat-square)](https://coveralls.io/r/catamphetamine/libphonenumber-js?branch=master)

A simpler and smaller rewrite of Google Android's `libphonenumber` library: easy phone number parsing and formatting in javascript.

[See Demo](https://catamphetamine.github.io/libphonenumber-js/)

## LibPhoneNumber

[`libphonenumber`](https://github.com/googlei18n/libphonenumber) is a phone number formatting and parsing library released by Google, originally developed for (and currently used in) Google's [Android](https://en.wikipedia.org/wiki/Android_(operating_system)) mobile phone operating system. Implementing a rigorous phone number formatting and parsing library was crucial for the phone OS overall usability (back then, in the early 2000s, it was originally meant to be a phone after all, not just a social media device).

`libphonenumber-js` is a simplified pure javascript port of the original `libphonenumber` library (written in C++ and Java because those are the programming languages used in Android OS). While `libphonenumber` has an [official javascript port](https://github.com/googlei18n/libphonenumber/tree/master/javascript) which is being maintained by Google, it is tightly coupled to Google's `closure` javascript utility framework. It can still be compiled into [one big bundle](https://github.com/ruimarinho/google-libphonenumber) which weighs 530 kilobytes (330 kB code + 200 kB metadata) — quite a size for a phone number input component.

One part of me was curious about how all this phone number parsing and formatting machinery worked, and another part of me was curious if there was a way to reduce those 530 kilobytes to something more reasonable while also getting rid of all the unnecessary bulk and rewriting it all in pure javascript. The resulting library does everything a modern web application needs while maintaining a much smaller size of about 110 kilobytes.

## Difference from Google's `libphonenumber`

  * Much smaller footprint: 110 kilobytes (30 kB code + 80 kB sufficient metadata) vs the original Google's 530 kilobytes (330 kB code + 200 kB full metadata).
  * Can search for phone numbers in text.
  * Doesn't parse alphabetic phone numbers like `1-800-GOT-MILK`.
  * Doesn't use ["carrier codes"](https://github.com/googlei18n/libphonenumber/blob/master/FALSEHOODS.md) when formatting numbers: "carrier codes" are only used in Colombia and Brazil and only when dialing within those countries from a mobile phone to a fixed line number.
  * Doesn't parse or format special local-only phone numbers: emergency phone numbers like `911`, ["short codes"](https://support.twilio.com/hc/en-us/articles/223182068-What-is-a-short-code-), numbers starting with a [`*`](https://github.com/googlei18n/libphonenumber/blob/master/FALSEHOODS.md), etc.
  * Doesn't parse or format phone numbers with ["dial out codes"](https://en.wikipedia.org/wiki/List_of_international_call_prefixes). The "dial out codes" are the prefixes prepended in order to call to another country. E.g. an international phone number `+ ...` would be called as `00 ...` from Europe and `011 ...` from the United States. The reason for not supporting "dial out codes" is that I don't see any use case where a user would input a phone number with a "dial out code" instead of using the `+ ...` notation.

## Usage

```js
import { parse, format, AsYouType } from 'libphonenumber-js'

parse('8 (800) 555 35 35', 'RU')
// { country: 'RU', phone: '8005553535' }

format({ country: 'US', phone: '2133734253' }, 'International')
format('+12133734253', 'International')
// '+1 213 373 4253'

new AsYouType().input('+12133734')
// '+1 213 373 4'
new AsYouType('US').input('2133734')
// '(213) 373-4'
```

## Country code definition

"Country code" means either a [two-letter ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (like `US`) or a special `001` country code used for non-geographical entities (as per [Google's libphonenumber library](https://github.com/googlei18n/libphonenumber/blob/0068d861a68d3d4612f7bf8646ab844dd3cefce5/java/libphonenumber/test/com/google/i18n/phonenumbers/RegionCode.java#L23-L24)). For example, `+7 800 555 35 35` phone number belongs to Russia so it has `RU` country code where as `+800 1 1111 1111` phone number could belong to any country so it has `001` country code.

## API

### parse(text, [defaultCountry], [options])

Attempts to parse a valid phone number from `text`.

If [`defaultCountry`](https://github.com/catamphetamine/libphonenumber-js#country-code-definition) is passed then it's gonna be the default country for parsing non-international phone numbers.

Returns `{ country, phone, ext }` where
 * `country` is a [country code](https://github.com/catamphetamine/libphonenumber-js#country-code-definition)
 * `phone` is a national (significant) number
 * `ext` is a phone number extension

If the phone number supplied isn't valid then an empty object `{}` is returned.

```js
parse('+1-213-373-4253') === { country: 'US', phone: '2133734253' }
parse('(213) 373-4253', 'US') === { country: 'US', phone: '2133734253' }

// Parses phone number extensions.
parse('(213) 373-4253 ext. 123', 'US') === { country: 'US', phone: '2133734253', ext: '123' }

// Parses RFC 3966 phone number URIs.
parse('tel:+78005553535;ext:123') === { country: 'RU', phone: '8005553535', ext: '123' }
```

Available `options`:

 * `defaultCountry : string` — Same as `defaultCountry` argument.

 * `extended : boolean` — If set to `true` then `parse()` will attempt to parse "possible" phone numbers even if they're classified as "invalid". The result of "extended" parsing has shape `{ country, countryCallingCode, carrierCode, phone, ext, valid: boolean, possible: boolean }`; some or all of these properties may be absent. The "extended" parsing is the default behaviour of the original Google's `libphonenumber`: it still returns parsed data even if the phone number being parsed is not considered valid (but is kinda "possible"). Though I don't know who might need such an advanced feature, still it [has been requested](https://github.com/catamphetamine/libphonenumber-js/issues/176) and has been implemented.

Speaking of phone number extensions, I myself consider them obsolete and I'd just discard the extension part given we're in the 21st century. Still, some people [asked](https://github.com/catamphetamine/libphonenumber-js/issues/129) for phone number extensions support so it has been added. But I personally think it's an unnecessary complication.

### format(number, format, [options])

Formats a `number` into a string according to a `format`.

Available `format`s:
  * `National` — e.g. `(213) 373-4253`
  * `International` — e.g. `+1 213 373 4253`
  * [`E.164`](https://en.wikipedia.org/wiki/E.164) — e.g. `+12133734253`
  * [`MSISDN`](https://en.wikipedia.org/wiki/MSISDN) — e.g. `12133734253`
  * [`RFC3966`](https://www.ietf.org/rfc/rfc3966.txt) (the phone number URI) — e.g. `tel:+12133734253;ext=123`

Available `options`:

```js
{
  formatExtension(number, extension) — Formats `number` and `extension` into a string.
                                       By default returns `${number} ext. ${extension}`.
}
```

The `number` argument must be either a `parse()`d phone number object (to strip national prefix) or an E.164 phone number (e.g. `+12133734253`). The `parse()`d phone number object argument be expanded into two string arguments for those who prefer this kind of syntax.

```js
format({ country: 'US', phone: '2133734253' }, 'International') === '+1 213 373 4253'
format('2133734253', 'US', 'International') === '+1 213 373 4253'
format('+12133734253', 'International') === '+1 213 373 4253'

// An example of an invalid phone number argument.
// (has not been parsed and therefore contains the `0` national prefix)
format('017212345678', 'DE', 'E.164') !== '+4917212345678'
// After proper parsing it works.
format(parse('017212345678', 'DE'), 'E.164') === '+4917212345678'

// Formatting phone number extensions (except for E.164).
format({ country: 'US', phone: '2133734253', ext: '123' }, 'National') ===  '(213) 373-4253 ext. 123'
```

### `class` AsYouType(defaultCountry)

Creates a formatter for partially entered phone number. The [`defaultCountry`](https://github.com/catamphetamine/libphonenumber-js#country-code-definition) is optional and, if specified, is gonna be the default country for formatting non-international phone numbers. The formatter instance has two methods:

 * `input(text)` — Takes any text and appends it to the input. Returns the formatted phone number.
 * `reset()` — Resets the input.

The formatter also has the following getters:

 * `country` — Phone number [country](https://github.com/catamphetamine/libphonenumber-js#country-code-definition).
 * `getNationalNumber()` — Returns the national number part of the phone number.
 * `template` — The template used to format the phone number. Digits (and the `+` sign, if present) are denoted by `x`-es.

```js
new AsYouType().input('+12133734') === '+1 213 373 4'
new AsYouType('US').input('2133734') === '(213) 373-4'

const asYouType = new AsYouType()
asYouType.input('+1-213-373-4253') === '+1 213 373 4253'
asYouType.country === 'US'
asYouType.getNationalNumber() === '2133734253'
asYouType.template === 'xx xxx xxx xxxx'
```

"As You Type" formatter was created by Google as part of their Android OS and therefore only works for numerical keyboard input, i.e. it can only accept digits (and a `+` sign in the start of an international number). When used on desktops where a user can input all kinds of punctuation (spaces, dashes, parens, etc) it simply ignores everything except digits. This solution is sufficient for all use cases except for phone number extensions which Google's "As You Type" formatter does not support. If your project requires phone number extensions input then use a separate input field for that.

### findPhoneNumbers(text, [defaultCountry], [options])

Searches for phone numbers in a given text. This is a basic substitute for Google's original `findNumbers()` function (described below).

```js
import { findPhoneNumbers } from 'libphonenumber-js'

findPhoneNumbers(`
  The number is +7 (800) 555-35-35 and
  not (213) 373-4253 as written
  in the document.
`, 'US')

// Outputs:
//
// [{
//   phone    : '8005553535',
//   country  : 'RU',
//   startsAt : 14,
//   endsAt   : 32
// },
// {
//   phone    : '2133734253',
//   country  : 'US',
//   startsAt : 41,
//   endsAt   : 55
// }]
```

If the text being searched in is big enough (say, a hundred thousand characters) then one can employ iterators to perform the search asynchronously (e.g. using `requestIdleCallback` or `requestAnimationFrame` to avoid freezing the user interface during the search).

ES6 iterator:

```js
import { searchPhoneNumbers } from 'libphonenumber-js'

const text = `
  The number is +7 (800) 555-35-35 and
  not (213) 373-4253 as written
  in the document.
`

async function() {
  for (const number of searchPhoneNumbers(text, 'US')) {
    console.log(number)
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  console.log('Finished')
}
```

Java-style iterator (for those still not using ES6):

```js
import { PhoneNumberSearch } from 'libphonenumber-js'

const search = new PhoneNumberSearch(`
  The number is +7 (800) 555-35-35 and
  not (213) 373-4253 as written
  in the document.
`, {
  defaultCountry: 'US'
})

// Search cycle iteration.
const iteration = () => {
  if (search.hasNext()) {
    console.log(search.next())
    setTimeout(iteration, 0)
  } else {
    console.log('Finished')
  }
}

// Run the search.
iteration()
```

### findNumbers(text, [defaultCountry], [options])

Searches for phone numbers in a given text. This is the Google's original implementation and it's not implemented in this library.

Although Google's javascript port doesn't support this functionality the Java and C++ ports do. I guess Google just doesn't need to crawl phone numbers on Node.js because they can afford to hire a Java/C++ developer to do that. Still, javascript nowadays is the most popular programming language given its simplicity and user-friendliness.

I made my take on porting Google's `PhoneNumberMatcher.java` into javascirpt and seems that it's doable. The overall syntax has mostly been ported but it's still quite far from finished and the code has not been tested, and I'm not searching for phone numbers in my projects, but if anyone needs that feature they could continue where I left off: see `findNumbers.js`, `src/PhoneNumberMatcher.js` and `src/PhoneNumberMatcher.test.js`. Such a person must also let others (including me) know that he's working on the feature to avoid any conflicts: a pull request must be created right away and code must be committed on a daily basis regardless of whether it works or not.

### getNumberType(number, [defaultCountry])

Determines phone number type (fixed line, mobile, toll free, etc). This function will work if `--extended` (or relevant `--types`) metadata is available (see [Metadata](#metadata) section of this document). The regular expressions used to differentiate between various phone number types consume a lot of space (two thirds of the total size of the `--extended` library build) therefore they're not included in the bundle by default.

The `number` argument can be either a result of the `parse()` function call — `{ country, phone }` — or a string possibly accompanied with `defaultCountry`.

```js
getNumberType('9160151539', 'RU') === 'MOBILE'
getNumberType({ phone: '9160151539', country: 'RU' }) === 'MOBILE'
```

### isValidNumber(number, [defaultCountry])

Checks if a phone number is valid.

The `number` argument can be either a result of the `parse()` function call — `{ country, phone }` — or a string possibly accompanied with `defaultCountry`.

```js
isValidNumber('+1-213-373-4253') === true
isValidNumber('+1-213-373') === false

isValidNumber('(213) 373-4253', 'US') === true
isValidNumber('(213) 37', 'US') === false

isValidNumber({ phone: '2133734253', country: 'US' }) === true
```

The difference between using `parse()` and `isValidNumber()` for phone number validation is that `isValidNumber()` also checks the precise regular expressions of possible phone numbers for a country. For example, for Germany `parse('123456', 'DE')` would return `{ country: 'DE', phone: '123456' }` because this phone number matches the general phone number rules for Germany. But, if the metadata is compiled with `--extended` (or relevant `--types`) flag (see below) and the precise regular expressions for possible phone numbers are included in the metadata then `isValidNumber()` is gonna use those precise regular expressions for validation and `isValid('123456', 'DE')` will return `false` because the phone number `123456` doesn't actually exist in Germany.

So, the general phone number rules for a country are mainly for phone number formatting: they dictate how different phone numbers (matching those general regular expressions) should be formatted. And `parse()` uses only those general regular expressions (as per the reference Google's `libphonenumber` [implementation](https://static.javadoc.io/com.googlecode.libphonenumber/libphonenumber/8.9.1/com/google/i18n/phonenumbers/PhoneNumberUtil.html#parse-java.lang.CharSequence-java.lang.String-)) to perform basic phone number validation. `isValidNumber()`, on the other hand, is all about validation, so it digs deeper into precise regular expressions (if they're included in metadata) for possible phone numbers for a given country. And that's the difference between them: `parse()` parses phone numbers and loosely validates them while `isValidNumber()` validates phone number precisely (provided the precise regular expressions are included in metadata).

By default those precise regular expressions aren't included in metadata because that would cause metadata to grow twice in its size (the complete metadata size is about 145 kilobytes while the default reduced metadata size is about 77 kilobytes). If anyone needs to use (or generate) custom metadata then it's quite easy to do so: follow the instructions provided in the [Customizing metadata](#customizing-metadata) section of this document.

#### Using phone number validation feature

I personally wouldn't rely on strict phone number validation too much because it might get outdated:

* First, new phone number rules are added to Google's `libphonenumber` library after they have already been implemented in real life (which introduces a delay).

* Then those new rules from Google's `libphonenumber` are updated automatically in this library (the scheduled update script introduces a small delay of 1 day, unless it malfunctions).

* And then there's still the web application itself using this library and until a developer installs `libphonenumber-js@latest` manually and redeploys the web application it's gonna use the old (potentially outdated) phone number validation rules which could result in losing customers with perfectly valid (but brand new) phone numbers if a website form is too strict about validating user's input.

Phone number validation rules are [constantly changing](https://github.com/googlei18n/libphonenumber/commits/master/resources/PhoneNumberMetadata.xml) for `--extended` rules and are fairly static for "general" ones. Still imagine a web application (e.g. a promosite or a "personal website") being deployed once and then running for years without any maintenance.

### getCountryCallingCode(country)

There have been requests for a function returning a country calling code by [country code](https://github.com/catamphetamine/libphonenumber-js#country-code-definition).

```js
getCountryCallingCode('RU') === '7'
getCountryCallingCode('IL') === '972'
```

## Metadata

Metadata is generated from Google's original [`PhoneNumberMetadata.xml`](https://github.com/googlei18n/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml) by transforming XML into JSON and removing unnecessary fields.

Currently I have a script set up monitoring changes to `PhoneNumberMetadata.xml` in Google's repo and automatically releasing new versions of this library when metadata in Google's repo gets updated. So this library's metadata is supposed to be up-to-date. Still, in case the automatic metadata update script malfunctions some day, anyone can request metadata update via a Pull Request here on GitHub:

  * Fork this repo
  * `npm install`
  * `npm run metadata:update:branch`
  * Submit a Pull Request to this repo from the `update-metadata` branch of your fork

`npm run metadata:update:branch` command creates a new `update-metadata` branch, downloads the new [`PhoneNumberMetadata.xml`](https://github.com/googlei18n/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml) into the project folder replacing the old one, generates JSON metadata out of the XML one, checks if the metadata has changed, runs the tests, commits the new metadata and pushes the commit to the remote `update-metadata` branch of your fork.

Alternatively, a developer may wish to update metadata urgently, without waiting for a pull request approval. In this case just perform the steps described in the [Customizing metadata](#customizing-metadata) section of this document.

## React

There's also a React component utilizing this library: [`react-phone-number-input`](https://github.com/catamphetamine/react-phone-number-input)

## Examples

For those asking for phone number examples for use in `<input placeholder/>`s there's `examples.mobile.json`.

<!-- ## To do

Everything's done -->

## Bug reporting

When reporting an issue one must also provide a link to [Google's `libphonenumber` demo page](https://libphonenumber.appspot.com/) illustrating the expected behaviour. This includes validation, parsing, formatting and "as you type" formatting. For example, for an Australian number `438 331 999` Google's demo [outputs four sections](https://libphonenumber.appspot.com/phonenumberparser?number=438331999&country=AU) — "Parsing Result", "Validation Results", "Formatting Results" and "AsYouTypeFormatter Results". In a bug report, first describe the observed `libphonenumber-js` demo result and then Google's demo result (with a link to it) which must differ from the observed `libphonenumber-js` demo result. If the observed `libphonenumber-js` demo result is the same as Google's demo result and you don't agree with Google's demo result then create an issue in [Google's repo](https://github.com/googlei18n/libphonenumber).

Phone number validation bugs should **only** be reported if they appear when using [custom metadata functions](#customizing-metadata) fed with `metadata.full.json` because by default all functions in this library use the reduced metadata set which results in looser validation than the original Google `libphonenumber`'s. The [demo page](https://catamphetamine.github.io/libphonenumber-js/) also uses the reduced metadata set and therefore its validation is also looser than the original Google `libphonenumber`'s.

## TypeScript

[TypeScript support](https://github.com/catamphetamine/libphonenumber-js/blob/master/index.d.ts) for this library is entirely community-driven. I myself don't use TypeScript. Send your pull requests.

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
  alert(new libphonenumber.AsYouType('US').input('213-373-4253'))
</script>
```

## Customizing metadata

This library comes prepackaged with three flavours of metadata

* `metadata.full.json` — contains everything, including all regular expressions for precise phone number validation and getting phone number type, but weighs `145 kilobytes`.
* `metadata.min.json` — (default) the minimal one, doesn't contain regular expressions for precise phone number validation and getting phone number type, weighs `80 kilobytes`.
* `metadata.mobile.json` — contains regular expressions for precise **mobile** phone number validation, weighs `105 kilobytes`.

Furthermore, if only a specific set of countries is needed in a project, and a developer really wants to reduce the resulting bundle size, say, by 50 kilobytes (even when including all regular expressions for precise phone number validation and getting phone number type), then he can generate such custom metadata and pass it as an extra argument to this library's functions.

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
* `--types ...` argument may be passed instead of `--extended` to only include the precise phone number type regular expressions for a specific set of phone number types (a comma-separated list, e.g. `--types mobile,fixed_line`). [The complete list of phone number types](https://github.com/catamphetamine/libphonenumber-js/blob/master/source/tools/generate.js#L6-L18).

Then use the generated `metadata.min.json` with the exported "custom" functions.

In ES6 that would be

```js
import {
  parse,
  format,
  isValidNumber,
  getNumberType,
  AsYouType
} from 'libphonenumber-js/custom'

import metadata from 'libphonenumber-js/metadata.full.json'

parse('+78005553535', metadata)
format({ phone: '8005553535', country: 'RU' }, metadata)
isValidNumber('+78005553535', metadata)
getNumberType('+78005553535', metadata)
new AsYouType('RU', metadata).input('+78005553535')
```

or

```js
import {
  parse as parseCustom,
  format as formatCustom,
  isValidNumber as isValidNumberCustom,
  getNumberType as getNumberTypeCustom,
  AsYouType as AsYouTypeCustom
} from 'libphonenumber-js/custom'

export const parse = (...args) => parseCustom(...args, metadata)
export const format = (...args) => formatCustom(...args, metadata)
export const isValidNumber = (...args) => isValidNumberCustom(...args, metadata)
export const getNumberType = (...args) => getNumberTypeCustom(...args, metadata)

export class AsYouType extends AsYouTypeCustom {
  constructor(country) {
    super(country, metadata)
  }
}
```

And for [Common.js](https://auth0.com/blog/javascript-module-systems-showdown/) environment that would be

```js
var custom = require('libphonenumber-js/custom')
var metadata = require(libphonenumber-js/metadata.full.json)

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

exports.getNumberType = function isValidNumber() {
  var parameters = Array.prototype.slice.call(arguments)
  parameters.push(metadata)
  return custom.getNumberType.apply(this, parameters)
}

exports.AsYouType = function AsYouType(country) {
  custom.AsYouType.call(this, country, metadata)
}

exports.AsYouType.prototype = Object.create(custom.AsYouType.prototype, {})
exports.AsYouType.prototype.constructor = exports.AsYouType
```

Metadata should be re-generated each time the project is being deployed because Google constantly updates their metadata.

<!-- ## To do -->

<!--
## Automatic metadata update setup

Create a daily (24 * 60 * 60) `launchd` job

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

## Advertisement

If you're looking for an international "2 days ago" javascript solution then check out [`javascript-time-ago`](https://github.com/catamphetamine/javascript-time-ago).

## License

[MIT](LICENSE)
