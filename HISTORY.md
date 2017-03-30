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