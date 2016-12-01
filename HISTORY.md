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