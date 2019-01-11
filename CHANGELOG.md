<!-- (breaking change) `parseNumber()` is now `extended: true` by default (and the `extended` flag is no longer supported) meaning that by default it will parse all even remotely hypothetical phone numbers (this was decided to be the primary use case for this function, and it's how Google's libphonenumber does it). Pass `strict: true` flag for the old "only parse valid numbers" behaviour. -->

<!-- (breaking change) `formatNumber()` no longer supports `formatNumber(numberString, countryString, format)` notation, use `formatNumber({ phone, country }, format)` notation instead. -->

<!-- `type` parameter has been added to `isValidNumber()` for validating phone numbers of a particual type (fixed line, mobile, etc). -->

<!-- (breaking change) Replaced `phone: ...` with `number: ...` in returned objects and arguments in all functions: `formatNumber()`, `parseNumber()`, `isValidNumber()`, `getNumberType()`, `findPhoneNumbers()`. -->

<!-- (breaking change) Removed deprecated `findPhoneNumbers()`, `searchPhoneNumbers()` and `PhoneNumberSearch` functions. Use `findNumbers()`, `searchNumbers()` and `PhoneNumberMatcher` instead. -->

<!-- (breaking change) Better API.

https://github.com/catamphetamine/libphonenumber-js/issues/259

Maybe something like:

const number = parseNumber(value)

const {
  number,
  country,
  nationalNumber,
  carrierCode,
  countryCallingCode,
  valid,
  possible
} = parseNumber(value, { extended: true })

// Maybe rename "extended" to something else.
-->

<!-- (breaking change)
`phone` property of phone number object renamed to `nationalNumber`
-->

<!-- (breaking change) `examples.mobile.json` now provides phone numbers in E.164 format (e.g. `+78005553535`). Previously those numbers were in "national (significant) number" form (e.g. `8005553535`).
-->

<!-- (breaking change) AsYouType -> AsYouTypeFormatter (maybe, or maybe not). -->

<!-- (breaking change) parse.js -> parseNumber.js, format.js -> formatNumber.js, validate.js -> isValidNumber.js. -->

<!-- (breaking change) `findNumbers()` now returns an array of `PhoneNumber` objects instead of objects having shape `{ country, phone }`. -->

<!-- (breaking change) Maybe change metadata from `.json` to `.js` to save size on `,0,` -> `,,`. -->

<!-- (breaking change) Prepend `+` in AsYouType if no `defaultCountry` has been set.

And edit the README:

 * `getNumber()` — Returns the [`PhoneNumber`](#phonenumber). Will return `undefined` if no [national (significant) number](#national-significant-number) has been entered so far, or if no `defaultCountry` has been set and the user enters a phone number not in international format.
-->

1.7.6 / 11.01.2019
==================

  * `findNumbers()`, `searchNumbers()`, `PhoneNumberMatcher` don't throw "Unknown country" error anymore: a non-existent country is simply ignored instead. Same goes for `getExampleNumber()` and `getExtPrefix()`.

  * `parsePhoneNumberFromString()` doesn't return `undefined` if a non-existent default country is passed: it simply ignores such country instead and still parses international numbers.

  * Added `isSupportedCountry(country)` function.

  * Added CDN bundles for `min`/`max`/`mobile` sub-packages.

  * Moved demo to `max` metadata (was `min` previously).

  * Added TypeScript definitions for `min`/`max`/`mobile`/`core` sub-packages.

1.7.1 / 01.12.2018
==================

  * Added `/min`, `/max`, `/mobile` and `/custom` subpackages pre-wired with different flavors of metadata. See the relevant readme section for more info.

  * Added `parsePhoneNumberFromString()` function (which doesn't throw but instead returns `undefined`).

1.7.0 / 31.12.2018
==================

  * Refactored the code to remove cyclic dependencies which caused warnings on React Native. It's not a breaking change but it's still a big code diff overall so incremented the "minor" version number.

1.6.2 / 18.10.2018
==================

  * Support Russian extension character "доб" as a valid one while parsing the numbers.

1.6.1 / 18.10.2018
==================

  * Added `.getNumber()` method to `AsYouType` formatter instance. Returns a `PhoneNumber`.

1.6.0 / 17.10.2018
==================

  * Added `parsePhoneNumber()` function and `PhoneNumber` class.

  * Added `v2: true` option to `findNumbers()` function.

  * Added `getExampleNumber()` function.

  * Added `isPossibleNumber()` function.

  * In `formatNumber()` renamed `National` to `NATIONAL` and `International` to `INTERNATIONAL`. The older variants still work but are considered deprecated.

  * (metadata file internal format breaking change) (doesn't affect users of this library) If anyone was using metadata files from this library bypassing the library functions (i.e. those who parsed `metadata.min.json` file manually) then there's a new internal optimization introduced in this version: previously `formats` were copy-pasted for each country of the same region (e.g. `NANPA`) while now the `formats` are only defined on the "main" country for region and other countries simply read the `formats` from it at runtime. This reduced the default metadata file size by 5 kilobytes.

1.5.0 / 26.09.2018
==================

  * Deprecated `findPhoneNumbers()`, `searchPhoneNumbers()` and `PhoneNumberSearch`. Use `findNumbers()`, `searchNumbers()` and `PhoneNumberMatcher` instead. The now-deprecated functions were a half-self-made implementation of Google's Java `findNumbers()` until the Java code was ported into javascript and passed tests. The port of Google's Java implementation is supposed to find numbers more correctly. It hasn't been tested by users in production yet, but the same tests as for the previous implementation of `findPhoneNumbers()` pass, so seems that it can be used in production.

1.4.6 / 12.09.2018
==================

  * Fixed `formatNumber('NATIONAL')` not formatting national phone numbers with a national prefix when it's marked as optional (e.g. Russia). Before it didn't add national prefix when formatting national numbers if national prefix was marked as optional. Now it always adds national prefix when formatting national numbers even when national prefix is marked as optional.

1.4.5 / 07.09.2018
==================

  * A bug in `matches_entirely` was found by a user which resulted in incorrect regexp matching in some cases, e.g. when there was a `|` in a regexp. This could cause incorrect `parseNumber()` results, or any other weird behaviour.

1.4.0 / 03.08.2018
==================

  * Changed the output of `AsYouType` formatter. E.g. before for `US` and input `21` it was outputting `(21 )` which is not good for phone number input (not intuitive and is confusing). Now it will not add closing braces which haven't been reached yet by the input cursor and it will also strip the corresponding opening braces, so for `US` and input `21` it now is just `21`, and for `213` it is `(213)`.

  * (could be a breaking change for those who somehow used `.template` property of an `AsYouType` instance) Due to the change in `AsYouType` formatting the `.template` property no longer strictly corresponds to the output, e.g. for `US` and input `21` the output is now `21` but the `.template` is still `(xxx) xxx-xxxx` like it used to be in the older versions when the output was `(21 )`. Therefore, a new function has been added to `AsYouType` instance called `.getTemplate()` which will return the _partial_ template for the currently input value, so for input `21` the output will be `21` and `.getTemplate()` will return `xx`, and for input `213` the output will be `(213)` and `.getTemplate()` will return `(xxx)`. So there is this difference between the new `.getTemplate()` function and the old `.template` property: the old `.template` property always returns the template for a fully entered phone number and the new `.getTemplate()` function always returns the template for the _partially_ entered phone number, i.e. for the partially entered number `(213) 45` it will return template `(xxx) xx` so it's a one-to-one correspondence now.

1.3.0 / 25.07.2018
==================

  * Fixed `parseNumber()`, `isValidNumber()` and `getNumberType()` in some rare cases (made them a bit less strict where it fits): previously they were treating `defaultCountry` argument as "the country" in case of local numbers, e.g. `isValidNumber('07624 369230', 'GB')` would be `false` because `07624 369230` number belongs to `IM` (the Isle of Man). While `IM` is not `GB` it should still be `true` because `GB` is the _default_ country, without it necessarily being _the_ country.

  * Added a new function `isValidNumberForRegion(number, country)` which mimics [Google's `libphonenumber`'s one](https://github.com/googlei18n/libphonenumber/blob/master/FAQ.md#when-should-i-use-isvalidnumberforregion).

1.2.13 / 30.05.2018
===================

  * Fixed a previously unnoticed [bug](https://github.com/catamphetamine/libphonenumber-js/issues/217) regarding parsing RFC3966 phone URIs: previously `:` was mistakenly being considered a key-value separator instead of `=`. E.g. it was parsing RFC3966 phone numbers as `tel:+78005553535;ext:123` instead of `tel:+78005553535;ext=123`. The bug was found and reported by @cdunn.

1.2.6 / 12.05.2018
===================

  * Removed `parseNumber()`'s `fromCountry` parameter used for parsing IDD prefixes: now it uses `defaultCountry` instead. `formatNumber()`'s `fromCountry` parameter stays and is not removed.

1.2.5 / 11.05.2018
===================

  * Optimized metadata a bit: using `0` instead of `null`/`false` and `1` instead of `true`.

1.2.0 / 08.05.2018
===================

  * Added support for [IDD prefixes](https://en.wikipedia.org/wiki/International_direct_dialing) — `parse()` now parses IDD-prefixed phones if `fromCountry` option is passed, `format()` now has an `IDD` format.

1.1.7 / 01.04.2018
===================

  * Added `parseNumber()` and `formatNumber()` aliases for `parse()` and `format()`. Now these are the default ones, and `parse()` and `format()` names are considered deprecated. The rationale is that `parse()` and `format()` function names are too unspecific and can clash with other functions declared in a javascript file. And also searching in a project for `parseNumber` and `formatNumber` is easier than searching in a project for `parse` and `format`.

  * Fixed `parseRFC3966()` and `formatRFC3966()` non-custom exports.

1.1.4 / 15.03.2018
===================

  * `parse()` is now more forgiving when parsing invalid international numbers. E.g. `parse('+49(0)15123020522', 'DE')` doesn't return `{}` and instead removes the invalid `(0)` national prefix from the number.

1.1.1 / 10.03.2018
===================

  * Added `PhoneNumberSearch` class for asynchronous phone number search.

1.1.0 / 09.03.2018
===================

  * Added `findPhoneNumbers` function.

1.0.22 / 13.02.2018
===================

  * Added `parseRFC3966` and `formatRFC3966` functions which are exported.

1.0.18 / 12.02.2018
===================

  * Fixed custom metadata backwards compatibility [bug](https://github.com/catamphetamine/libphonenumber-js/issues/180) introduced in `1.0.16`. All people who previously installed `1.0.16` or `1.0.17` should update.
  * Refactored metadata module which now supports versioning by adding the `version` property to metadata JSON.

1.0.17 / 07.02.2018
===================

  * Fixed `RFC3966` format not prepending `tel:` to the output.
  * Renamed `{ possible: true }` option to `{ extended: true }` and the result is now more verbose (see the README).
  * Added `possible_lengths` property in metadata: metadata generated using previous versions of the library should be re-generated with then new version.

1.0.16 / 07.02.2018
===================

  * (experimental) Added `{ possible: true }` option for `parse()` for parsing "possible numbers" which are not considered valid (like Google's demo does). E.g. `parse('+71111111111', { possible: true }) === { countryCallingCode: '7', phone: '1111111111', possible: true }` and `format({ countryCallingCode: '7', phone: '1111111111' }, 'E.164') === '+71111111111'`.
  * `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
  * `getPhoneCodeCustom` name is deprecated, use `getCountryCallingCodeCustom` instead.
  * `AsYouType.country_phone_code` renamed to `AsYouType.countryCallingCode` (but no one should have used that property).

1.0.0 / 21.01.2018
==================

  * If `country: string` argument is passed to `parse()` now it becomes "the default country" rather than "restrict to country" ("restrict to country" option is gone).
  * `parse()` `options` argument changed: it's now an undocumented feature and can have only a single option inside — `defaultCountry: string` — which should be passed as a string argument instead.
  * Removed all previously deprecated stuff: all underscored exports (`is_valid_number`, `get_number_type` and `as_you_type`), lowercase exports for `asYouType` and `asYouTypeCustom` (use `AsYouType` and `AsYouTypeCustom` instead), `"International_plaintext"` format (use `"E.164"` instead).
  * Integer phone numbers no longer [get automatically converted to strings](https://github.com/googlei18n/libphonenumber/blob/master/FALSEHOODS.md).
  * `parse()`, `isValidNumber()`, `getNumberType()` and `format()` no longer accept `undefined` phone number argument: it must be either a string or a parsed number object having a string `phone` property.

0.4.52 / 21.01.2018
===================

  * Added `formatExtension(number, extension)` option to `format()`

0.4.50 / 20.01.2018
===================

  * Added support for phone number extensions.
  * `asYouType` name is deprecated, use `AsYouType` instead (same goes for `asYouTypeCustom`).
  * `is_valid_number`, `get_number_type` and `as_you_type` names are deprecated, use camelCased names instead.
  * `International_plaintext` format is deprecated, use `E.164` instead.
  * Added `RFC3966` format for phone number URIs (`tel:+1213334455;ext=123`).

0.4.2 / 30.03.2017
===================

  * Added missing `getNumberTypeCustom` es6 export

0.4.0 / 29.03.2017
===================

  * Removed `.valid` from "as you type" formatter because it wasn't reliable (gave false negatives). Use `isValidNumber(value)` for phone number validation instead.

0.3.11 / 07.03.2017
===================

  * Fixed a bug when "as you type" formatter incorrectly formatted the input using non-matching phone number formats

0.3.8 / 25.02.2017
===================

  * Loosened national prefix requirement when parsing (fixed certain Brazilian phone numbers parsing)

0.3.6 / 16.02.2017
===================

  * Added more strict validation to `isValidNumber`
  * Fixed CommonJS export for `getNumberType`

0.3.5 / 15.02.2017
===================

  * Now exporting `getNumberType` function

0.3.0 / 29.01.2017
===================

  * Removed `libphonenumber-js/custom.es6` exported file: now everything should be imported from the root package in ES6-capable bundlers (because tree-shaking actually works that way)
  * Now custom functions like `parse`, `format` and `isValidNumber` are not bound to custom metadata: it's passed as the last argument instead. And custom `asYouType` is now not a function — instead, `asYouType` constructor takes an additional `metadata` argument

0.2.29 / 12.01.2017
===================

  * Fixed `update-metadata` utility

0.2.26 / 02.01.2017
===================

  * Added national prefix check for `parse` and `isPhoneValid`

0.2.25 / 30.12.2016
===================

  * A bit more precise `valid` flag for "as you type" formatter

0.2.22 / 28.12.2016
===================

  * Added metadata update `bin` command for end users (see README)
  * Added the ability to include extra regular expressions for finer-grained phone number validation

0.2.20 / 28.12.2016
===================

  * Added the ability to use custom-countries generated metadata as a parameter for the functions exported from this library

0.2.19 / 25.12.2016
===================

  * Small fix for "as you type" to not prepend national prefix to the number being typed

0.2.13 / 23.12.2016
===================

  * Reset `default_country` for "as you type" if the input is an international phone number

0.2.12 / 23.12.2016
===================

  * (misc) Small fix for `format()` when the national number is `undefined`

0.2.10 / 23.12.2016
===================

  * Better "as you type" matching: when the national prefix is optional it now tries both variants — with the national prefix extracted and without

0.2.9 / 22.12.2016
===================

  * Exporting `metadata` and `getPhoneCode()`

0.2.6 / 22.12.2016
===================

  * Fixed a minor bug in "as you type" when a local phone number without national prefix got formatted with the national prefix

0.2.2 / 14.12.2016
===================

  * Fixed a bug when country couldn't be parsed from a phone number in most cases

0.2.1 / 10.12.2016
===================

  * Added `.country_phone_code` readable property to "as you type" formatter

0.2.0 / 02.12.2016
===================

  * "As you type" formatter's `country_code` argument is now `default_country_code`, and it doesn't restrict to the specified country anymore.

0.1.17 / 01.12.2016
===================

  * "As you type" formatter `template` fix for national prefixes (which weren't replaced with `x`-es)

0.1.16 / 01.12.2016
===================

  * "As you type" formatter now formats the whole input passed to the `.input()` function one at a time without splitting it into individual characters (which yields better performance)

0.1.14 / 01.12.2016
===================

  * Added `valid`, `country` and `template` fields to "as you type" instance

0.1.12 / 30.11.2016
===================

  * Managed to reduce metadata size by another 5 KiloBytes removing redundant (duplicate) phone number type regular expressions (because there's no "get phone type" API in this library).

0.1.11 / 30.11.2016
===================

  * Managed to reduce metadata size by 10 KiloBytes removing phone number type regular expressions when `leading_digits` are present.

0.1.10 / 30.11.2016
===================

  * Turned out those numerous bulky regular expressions (`<fixedLine/>`, `<mobile/>`, etc) are actually required to reliably infer country from country calling code and national phone number in cases where there are multiple countries assigned to the same country phone code (e.g. NANPA), so I've included those big regular expressions for those ambiguous cases which increased metadata size by 20 KiloBytes resulting in a total of 90 KiloBytes for the metadata.

0.1.9 / 30.11.2016
===================

  * Small fix for "as you type" formatter: replacing digit placeholders (punctuation spaces) with regular spaces in the output

0.1.8 / 29.11.2016
===================

  * Fixed a bug when national prefix `1` was present in "as you type" formatter for NANPA countries (while it shouldn't have been present)

0.1.7 / 29.11.2016
===================

  * (may be a breaking change) renamed `.clear()` to `.reset()` for "as you type" formatter

0.1.5 / 29.11.2016
===================

  * Better `asYouType` (better than Google's original "as you type" formatter)

0.1.0 / 28.11.2016
===================

  * Added `asYouType` and `isValidNumber`.

0.0.3 / 24.11.2016
===================

  * Added `format` function.

0.0.1 / 24.11.2016
===================

  * Initial release. `parse` function is working.