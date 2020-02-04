# Metadata

This document describes `metadata.json` that's generated from `PhoneNumberMetadata.xml` by running `npm run metadata:generate` command. It serves as an intermediary step for generating all other metadata (such as `metadata.min.json`), and is therefore not included in the final distribution. See [`PhoneNumberMetadata.xml`](https://github.com/google/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml) in Google's repo. They also have some [docs](https://github.com/google/libphonenumber/blob/master/resources/phonemetadata.proto) on metadata fields too.

## Country calling codes

`country_calling_codes` — A list of countries by country calling code: some country calling codes are shared between several countries (for example, United States and Canada).

## Countries

`countries` — Contains metadata for each country.

### `phone_code`

Country calling code, duplicated here for easy lookup of country calling code by country. Could be considered "reverse lookup" compared to `country_calling_codes`.

### `idd_prefix`

[International Direct Dialing prefix](https://wikitravel.org/en/International_dialling_prefix) when calling out of this country. "IDD prefixes" are used to call from one country to another. "IDD prefixes" originated when telephony was still analogue and analogue phones didn't have a `+` input. Nowadays, mobile phone users dial international numbers using a `+` rather than an "IDD prefix", but the mobile phone operating system replaces the `+` with an "IDD prefix" under the hood. For example, to call a Russian number `+7 800 555 35 35` from US the dialled digits would be `01178005553535` where `011` is an "IDD prefix".

### `default_idd_prefix`

When a country supports different "IDD prefixes", the `idd_prefix` is a regular expression and `default_idd_prefix` is the default "IDD prefix".

### `ext`

Localized `" ext. "` prefix for this country. For example, in Russia it's `" доб. "`. Is only used for formatting phone numbers having "extensions" (usually these're organizational phone numbers: businesses, governmental institutions, educational institutions, etc).

### `leading_digits`

When several countries share the same country calling code, these "leading digits" are the means of determining which one of these countries does a phone number belong to. For example, Antigua and Barbuda have `leading_digits: "268"` and share `1` country calling code with USA, so if an international phone number starts with `+1268` then it belongs to Antigua and Barbuda.

`leading_digits` does not contain all the prefixes valid for a country: for example, `800` numbers are valid for all [NANPA](https://en.wikipedia.org/wiki/North_American_Numbering_Plan) countries and are hence not listed here. `leading_digits` regular expression is used merely as a short-cut for working out which country a phone number comes from.

### `national_number_pattern`

A regular expression covering all possible phone numbers for the country.

### `national_prefix`

"National prefix", also known as "National Direct Dialing prefix". In the early days of analogue telephony, countries were divided into "areas" (for example, cities), and calling within an area (for example, a city) would only involve dialing a phone number without "area code" digits, but calling from one "area" (city) to another (city) would require dialing a "national prefix" first, so that the analogue telephone station would switch the user into "nation-wide" calling mode first.

For example, in New Zealand, the number that would be locally dialled as `09 345 3456` would be dialled from overseas as `+64 9 345 3456`. In this case, `0` is the national prefix.

Other national prefix examples: `1` in US, `0` in France and UK, `8` in Russia.

### `national_prefix_for_parsing`

`national_prefix_for_parsing` is used to parse a [national (significant) number](https://github.com/catamphetamine/libphonenumber-js#national-significant-number) from a phone number. Contrary to its name, `national_prefix_for_parsing` is used not just for parsing a "national prefix" out of a phone number (just `national_prefix` property would be sufficient for that) but for also parsing any other possible phone number prefixes out of a phone number, if there're any, and for any other cases like handling a missing `340` area code for US Virgin Islands. So it's actually not "national prefix for parsing" but rather "national number prefix for parsing".

For example, some countries (Argentina, Brazil) use ["carrier codes"](https://www.voip-info.org/carrier-identification-codes/), in which case `national_prefix_for_parsing` includes both national prefix and all possible "carrier codes". So, for example, to dial the number `2222-2222` in Fortaleza, Brazil (national prefix `0`, area code `85`) using the long distance carrier Oi (selection code `31`), one would dial `0 31 85 2222 2222`, and Brazil's `national_prefix_for_parsing` is `0(?:(1[245]|2[1-35]|31|4[13]|[56]5|99)(\d{10,11}))?`.

As another example, some countries support "utility" prefixes, like Australia (national prefix `0`) that supports `1831` prefix to [hide your phone number](https://exchange.telstra.com.au/how-to-block-your-number-when-calling-someone/) when calling somebody (and `1832` to un-hide it when in "permanent" hiding mode), and so Australia's `national_prefix_for_parsing` is `0|(183[12])`.

Another example are U.S. Virgin Islands (national prefix `1`) whose phone numbers always start with a `340` area code because there's no other area code in this tiny (`346.36` square kilometers) island country. So it's common for its citizens to call `693-4800` instead of `(340) 693-4800`, and Google's `libphonenumber` handles this case by `national_prefix_for_parsing` being `1|([2-9]\d{6})$`.

Another type of "prefix" is a ["carrier code"](https://www.voip-info.org/carrier-identification-codes/). If `national_prefix_transform_rule` is defined and `national_prefix_for_parsing` has more than one "capturing group", then the first "capturing group" is the "carrier code". If `national_prefix_transform_rule` is not defined and `national_prefix_for_parsing` has any "capturing groups", then the first "capturing group" is the "carrier code".

### `national_prefix_transform_rule`

If `national_prefix_for_parsing` regular expression contains ["capturing groups"](https://www.regular-expressions.info/refcapture.html) (parentheses), then `national_prefix_transform_rule` defines how a national phone number is parsed into a [national (significant) number](https://github.com/catamphetamine/libphonenumber-js#national-significant-number). So, in a way, they're the "two side of one coin", being "alter egos" of each other: whenever `national_prefix_for_parsing` removes a "significant" part of a phone number, it does so with a "capturing group", so that `national_prefix_transform_rule` would immediately put it back.

Using the above example for U.S. Virgin Islands, its `national_prefix_for_parsing` is `1|([2-9]\d{6})$`, and `national_prefix_transform_rule` is `340$1`, so a phone number `693-4800` would first be parsed by `national_prefix_for_parsing` into an empty string and `$1` "captured group" being `6934800`, and then that empty string would be transformed back into `3406934800` number by `national_prefix_transform_rule`, resulting into `693-4800` national phone number being parsed into `3406934800` national (significant) number.

Another case when `national_prefix_formatting_rule` is used is inside [`format`s](#formats) to define how national prefix changes how a phone number should be formatted.

### `types`

Regular expressions for all possible phone number types for this country: fixed line, mobile, toll free, premium rate, [etc](https://github.com/catamphetamine/libphonenumber-js#gettype).

#### `pattern`

A regular expression for a national (significant) number matching the type.

#### `possible_lengths`

Possible lengths of a national (significant) number matching the type. Is always present.
### `examples`

Phone number examples for each of the phone number `types`.

### `possible_lengths`

Possible lengths of a national (significant) number for this numbering plan. This property is a combination of `possible_lengths` of all `types`. Is always present.

### `formats`

Describes all possible phone number formats for this country. May be missing if phone numbers aren't formatted for this country (there're many such countries, usually small islands).

#### `pattern`

A regular expression for a phone number supported by this format.

For example, in `US` there's only one possible phone number format, and it's `pattern` is `(\d{3})(\d{3})(\d{4})`, meaning that the national (significant) number must be `3 + 3 + 4 = 10` digits long (for example, `2133734253`), and is divided into three groups of digits for formatting (in this case, `213`, `373` and `4253`).

#### `format`

Defines how the aforementioned groups of digits are combined when formatting a phone number.

For example, in `US` there's only one possible phone number format, and it's `format` is `($1) $2-$3`, so `2133734253` national (significant) number is formatted as `(213) 373-4253`.

#### `international_format`

Parentheses arond "area code" only make sense when formatting a national phone number, so international phone numbers don't use them, hence the explicit `international_format` in addition to the national `format`.

For example, in `US` there's only one possible phone number format, and it's `format` is `($1) $2-$3`, while its `international_format` is `$1-$2-$3`, meaning that `2133734253` national (significant) number is formatted as `+1 213 373-4253` when formatted for international dialing.

#### `national_prefix_formatting_rule`

`national_prefix_formatting_rule` is sometimes used to define how national prefix changes how a phone number should be formatted. For example, in Russia (national prefix `8`), all `format`s have `national_prefix_formatting_rule` `8 ($1)`, meaning that a `88005553535` phone number is first stripped of `8` national prefix into a `8005553535` national (significant) number, then the national (significant) number is first parsed using `(\d{3})(\d{3})(\d{2})(\d{2})` format `pattern` and then formatted using `$1 $2-$3-$4` format `format` into `800 555-35-35`, and, after that, `national_prefix_formatting_rule` `8 ($1)` is applied, resulting in `8 (800) 555-35-35`. Have the phone number been input without the `8` national prefix, the formatted phone number would be `800 555-35-35` (without parentheses).

#### `national_prefix_is_optional_when_formatting`

This field specifies whether the national prefix can be omitted when formatting a number in national format, even though it usually wouldn't be. For example, a UK (`GB`) number would be formatted by `libphonenumber` as `020 XXXX XXXX`. If they have commonly seen this number written by people without the leading 0, for example as `(20) XXXX XXXX`, `libphonenumber` would be updated with `national_prefix_is_optional_when_formatting` being `true` for that `format` of `GB` country.

#### `leading_digits_patterns`

"Leading digits" patterns are used in `AsYouType` formatter to choose a format suitable for the phone number being input: if a phone number's "leading digits" match those of a format, then that format is used to format the phone number being input. Each subsequent leading digits pattern in `leading_digits_patterns` array requires one more leading digit.

## Non-geographic

There're [calling codes](https://github.com/catamphetamine/libphonenumber-js#non-geographic) that don't correspond to any country. For example, "Global Mobile Satellite System" (`+881`). Such phone numbering systems are called "non-geographic entities" in Google's code. These "non-geographic entitites" reside in their own `nonGeographic` property, analogous to the `countries` property. `nonGeographic` is an object with keys being calling codes of the corresponding "non-geographic entities", and values being same as the values of the `countries` property.

"Non-geographic" numbering plans don't have [`possible_lengths`](#possible-lengths).