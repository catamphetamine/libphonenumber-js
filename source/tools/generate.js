import { parseString } from 'xml2js'

import { DIGIT_PLACEHOLDER } from '../AsYouType'
// import { isSingleIDDPrefix } from '../IDD'

const phone_number_types =
[
	'premium_rate',
	'toll_free',
	'shared_cost',
	'voip',
	'personal_number',
	'pager',
	'uan',
	'voice_mail',
	'fixed_line',
	'mobile'
]

// Excessive fields from "PhoneNumberMetadata.xml"
// aren't included to reduce code complexity and size:
//
// * `<references>` — a link to ITU (International Telecommunication Union)
//                    document describing phone numbering plan for a country
//
// * `<noInternationalDialling>` — who needs to input non-internationally-dialable phones
//
// * `<areaCodeOptional>` — we aren't in the XXth century,
//                          it's a globalized world, so write your
//                          phone numbers with area codes.
//
// * `<fixedLine>`, `<mobile>`, `<pager>`,
//   `<tollFree>`, `<premiumRate>`,
//   `<sharedCost>`, `<personalNumber>`,
//   `<voip>`, `<uan>`, `<voicemail>` — who needs that in the XXIst century.
//                                      just go mobile and stop talking nonsense.
//
// * `internationalPrefix`,
//   `preferredInternationalPrefix` — who needs to parse (or format) those weird
//                                    "internationally dialed" phone numbers
//                                    like "011 ..." in the USA.
//                                    this isn't XXth century, just use mobile phones.
//
// * `preferredExtnPrefix` — Localized " ext. ". E.g. ", доб. " instead of " ext. " for Russia.
//
// * `leadingZeroPossible` — (aka "italian leading zero")
//                           who needs to parse a phone number into an integer.
//                           just keep it as a string.
//
// * `carrierCodeFormattingRule` — only used in Brazil and Colombia
//                                 when dialing from within those countries
//                                 from mobile phones to fixed line phone numbers.
//                                 i guess brazilians and colombians
//                                 already know when to add those carrier codes
//                                 by themselves (and when not to add them)
//
// * `mobileNumberPortableRegion` — is only used to disable phone number type detection
//
// * `<possibleLengths>` — is a redundant field to speed up testing of
//                         whether a phone number format can be used to format
//                         a particular national (significant) phone number.
//
// `libphonenumber/BuildMetadataFromXml.java` was used as a reference.
// https://github.com/googlei18n/libphonenumber/blob/master/tools/java/common/src/com/google/i18n/phonenumbers/BuildMetadataFromXml.java
//
// There are three Xml metadata files in Google's `libphonenumber`:
//
//  * PhoneNumberMetadata.xml — core data, used both for parse/format and "as you type"
//
//  * PhoneNumberAlternateFormats.xml — alternative phone number formats.
//                                      is presumably used for parsing phone numbers
//                                      written in "alternative" formats.
//                                      is not used by "as you type"
//                                      presumably because of formats ambiguity
//                                      when combined with the core data.
//                                      this metadata is not used in this library
//                                      as there's no clear description on what to do with it
//                                      and how it works in the original `libphonenumber` code.
//
//  * ShortNumberMetadata.xml — emergency numbers, etc. not used in this library.
//
// @returns
//
// {
// 	country_calling_codes:
// 	{
// 		'7': ['RU', 'KZ', ...],
// 		...
// 	},
// 	countries:
// 	{
// 		RU:
// 		{
// 			phone_code: "7",
// 			national_number_pattern: "[347-9]\\d{9}",
// 			national_prefix: "8",
// 			national_prefix_formatting_rule: "8 ($1)",
// 			national_prefix_is_optional_when_formatting: true,
// 			types:
// 			{
// 				fixed_line: "(?:3(?:0[12]|4[1-35-79]|5[1-3]|65|8[1-58]|9[0145])|4(?:01|1[1356]|2[13467]|7[1-5]|8[1-7]|9[1-689])|8(?:1[1-8]|2[01]|3[13-6]|4[0-8]|5[15]|6[1-35-79]|7[1-37-9]))\\d{7}",
// 				mobile: "9\\d{9}",
// 				...
// 			},
// 			examples:
// 			{
// 				fixed_line: '4955553535',
// 				mobile: '9991234567',
// 				...
// 			},
// 			formats:
// 			[{
// 				pattern: "([3489]\\d{2})(\\d{3})(\\d{2})(\\d{2})",
// 				leading_digits_patterns: ["[3489]"],
// 				format: "$1 $2-$3-$4"
// 			},
// 			...]
// 		},
// 		...
// 	}
// }
//
// `country_calling_codes` map is kinda redundant.
// Not sure why did I choose to place country phone codes
// into a separate structure inside metadata instead of generating it in runtime.
// One extra feature it gives though is it tells what's the
// "default" country for a given country phone code.
// E.g. for country phone code `1` the "default" country is "US"
// and therefore "US" is the first country code in the
// `country_calling_codes["1"]` list.
// The "default" country is the one other countries
// with the same country phone code inherit phone number formatting rules from.
// For example, "CA" (Canada) inhertis phone number formatting rules from "US".
//
// `country_calling_codes` data takes about 3 KiloBytes
// so it could kinda make sense to drop it from the metadata file
// replacing it with a "default" country flag (something like `1` for "yes").
// In that scenario `country_calling_codes` would be generated on startup.
// It would have to also provide an exported `getCountryPhoneCodes()` function
// which would take `metadata` and return `country_calling_codes` map
// because some people use that `country_calling_codes` map in their projects.
//
// On the other hand, having `country_calling_codes`
// prepopulated yields more elegance to the exports
// because if `country_calling_codes` wasn't part of metadata
// it would have to be computed somewhere in global scope
// therefore the modules wouldn't be strictly "pure"
// so maybe `country_calling_codes` stays as part of metadata.
//
export default function(input, version, included_countries, extended, included_phone_number_types)
{
	// Validate `included_phone_number_types`
	if (included_phone_number_types)
	{
		for (const _type of included_phone_number_types)
		{
			if (phone_number_types.indexOf(_type) < 0)
			{
				return Promise.reject(`Unknown phone number type: ${_type}`)
			}
		}
	}

	// Parse the XML metadata.
	// See: https://gitlab.com/catamphetamine/libphonenumber-js/blob/master/METADATA.md
	return parseStringPromisified(input).then((xml) =>
	{
		// https://github.com/googlei18n/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml
		// https://github.com/googlei18n/libphonenumber/blob/master/resources/phonemetadata.proto
		// https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js
		// https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/asyoutypeformatter.js

		const country_calling_code_to_countries = {}
		const countries = {}
		const nonGeographic = {}

		for (const territory of xml.phoneNumberMetadata.territories[0].territory)
		{
			// A two-letter country code
			const country_code = territory.$.id

			// Skip this country if it has not been explicitly included
			if (included_countries && !included_countries.has(country_code)) {
				continue
			}

			if (territory.$.nationalPrefixOptionalWhenFormatting) {
				throw new Error('`nationalPrefixOptionalWhenFormatting` encountered on a country level: uncomment the relevant code part below.')
			}

			// Country metadata
			const country =
			{
				// Phone code related fields:

				// Phone code for phone numbers in this country.
				//
				// E.g. `1` for both USA and Canada.
				//
				phone_code: territory.$.countryCode,

				// International Direct Dialing prefix.
				idd_prefix: territory.$.internationalPrefix,
				default_idd_prefix: territory.$.preferredInternationalPrefix,

				// Localized " ext. " prefix.
				ext: territory.$.preferredExtnPrefix,

				// In case of several countries
				// having the same country phone code,
				// these leading digits are the means
				// of classifying an international phone number
				// whether it belongs to a certain country.
				//
				// E.g. for Antigua and Barbuda
				// country phone code is `1` (same as USA)
				// and leading digits are `268`.
				//
				leading_digits: territory.$.leadingDigits,

				// The regular expression of all possible
				// national (significant) numbers for this country.
				national_number_pattern: territory.generalDesc[0].nationalNumberPattern[0].replace(/\s/g, ''),

				// National prefix related fields:

				// aka "trunk code".
				// This is the prefix prepended to a
				// national (significant) phone number
				// when dialed from within the country.
				// E.g. `0` for UK.
				national_prefix: territory.$.nationalPrefix,

				// In some (many) countries the national prefix
				// is not just a constant digit (like `0` in UK)
				// but can be different depending on the phone number
				// (and can be also absent for some phone numbers).
				//
				// So `national_prefix_for_parsing` is used when parsing
				// a national-prefixed (local) phone number
				// into a national significant phone number
				// extracting that possible national prefix out of it.
				//
				national_prefix_for_parsing : territory.$.nationalPrefixForParsing ? territory.$.nationalPrefixForParsing.replace(/\s/g, '') : undefined,

				// If `national_prefix_for_parsing` regular expression
				// contains "captured groups", then `national_prefix_transform_rule`
				// defines how the national-prefixed (local) phone number is
				// parsed into a national significant phone number.
				//
				// Pseudocode:
				//
				// national_prefix_pattern = regular_expression('^(?:' + national_prefix_for_parsing + ')')
				// national_significant_number = all_digits.replace(national_prefix_pattern, national_prefix_transform_rule)
				//
				// E.g. if a country's national numbers are 6-digit
				// and national prefix is always `0`,
				// then `national_prefix_for_parsing` could be `0(\d{6})`
				// and the corresponding `national_prefix_transform_rule` would be `$1`
				// (which is the default behaviour).
				//
				// Currently this feature is only used in
				// Argentina, Brazil, Mexico and San Marino
				// due to their messy telephone numbering plans.
				//
				// For example, mobile numbers in Argentina are written in two completely
				// different ways when dialed in-country and out-of-country
				// (e.g. 0343 15-555-1212 is exactly the same number as +54 9 3435 55 1212).
				// Therefore for Argentina `national_prefix_transform_rule` is `9$1`.
				//
				national_prefix_transform_rule: territory.$.nationalPrefixTransformRule,

				// Controls how national prefix is written
				// in a formatted local phone number.
				//
				// E.g. in Armenia national prefix is `0`
				// and `national_prefix_formatting_rule` is `($NP$FG)`
				// which means that a national significant phone number `xxxxxxxx`
				// matching phone number pattern `(\d{2})(\d{6})` with format `$1 $2`
				// is written as a local phone number `(0xx) xxxxxx`.
				//
				// Can be `undefined`.
				//
				national_prefix_formatting_rule: getNationalPrefixFormattingRule(territory.$.nationalPrefixFormattingRule, territory.$.nationalPrefix),

				// Is it possible that a national (significant)
				// phone number has leading zeroes?
				//
				// E.g. in Gabon some numbers start with a `0`
				// while the national prefix is also `0`
				// which is optional for mobile numbers.
				//
				// This seems to only be used for validating
				// possible formats in AsYouType formatter.
				//
				// national_prefix_is_optional_when_formatting: territory.$.nationalPrefixOptionalWhenFormatting ? Boolean(territory.$.nationalPrefixOptionalWhenFormatting) : undefined,

				// I suppose carrier codes can be omitted.
				// They are required only for Brazil and Columbia,
				// and only when calling to fixed line numbers
				// from mobile phones within those countries.
				// I guess people living in those countries
				// would know that they need to add carrier codes.
				// Other people don't need to know that.
				// Anyway, if someone sends a Pull Request
				// implementing carrier codes as Google's `libphonenumber` does
				// then such Pull Request will likely be merged.
				//
				// // In some countries carrier code is required
				// // to dial certain phone numbers.
				// //
				// // E.g. in Colombia calling to fixed line numbers
				// // from mobile phones requires a carrier code when called within Colombia.
				// // Or, for example, Brazilian fixed line and mobile numbers
				// // need to be dialed with a carrier code when called within Brazil.
				// // Without that, most of the carriers won't connect the call.
				// // These are the only two cases when "carrier codes" are required.
				// //
				// carrier_code_formatting_rule: territory.$.carrierCodeFormattingRule,

				// These `types` will be purged later,
				// if they're not needed (which is most likely).
				// See `country_calling_code_to_countries` ambiguity for more info.
				//
				types: get_phone_number_types(territory),

				// Will be filtered out during compression phase
				examples: get_phone_number_examples(territory)
			}

			// Check that national (significant) phone number pattern
			// is set for this country (no "default" value here)
			if (!country.national_number_pattern)
			{
				throw new Error(`"generalDesc.nationalNumberPattern" is missing for country ${country_code} metadata`)
			}

			// Check that an IDD prefix is always defined.
			if (country_code !== '001' && !country.idd_prefix)
			{
				throw new Error(`"generalDesc.internationalPrefix" is missing for country ${country_code} metadata`)
			}

			// // Check that a preferred IDD prefix is always defined if IDD prefix is a pattern.
			// if (country_code !== '001' && !isSingleIDDPrefix(country.idd_prefix) && !country.default_idd_prefix)
			// {
			// 	throw new Error(`"generalDesc.preferredInternationalPrefix" is missing for country ${country_code} metadata`)
			// }

			// Some countries don't have `availableFormats` specified,
			// because those formats are inherited from the "main country for region":
			// all non-"main" countries inherit their formats from the "main" country for that region.
			if (territory.availableFormats)
			{
				country.formats = territory.availableFormats[0].numberFormat.map((number_format) =>
				({
					pattern: number_format.$.pattern,
					leading_digits_patterns: number_format.leadingDigits ? number_format.leadingDigits.map(leading_digits => leading_digits.replace(/\s/g, '')) : undefined,
					national_prefix_formatting_rule: getNationalPrefixFormattingRule(number_format.$.nationalPrefixFormattingRule, territory.$.nationalPrefix),
					national_prefix_is_optional_when_formatting: number_format.$.nationalPrefixOptionalWhenFormatting ? Boolean(number_format.$.nationalPrefixOptionalWhenFormatting) : undefined,
					format: number_format.format[0],
					international_format: number_format.intlFormat ? number_format.intlFormat[0] : undefined
				}))
				// Screw local-only formats
				.filter(format => format.international_format !== 'NA')

				// Sanity check (using no "default" for this field)
				for (const format of country.formats)
				{
					// Never happens
					if (!format.format)
					{
						throw new Error(`No phone number format "format" supplied for pattern ${format.pattern} for ${country_code}`)
					}

					// Never happens
					if (format.format.indexOf(DIGIT_PLACEHOLDER) >= 0)
					{
						throw new Error(`Phone number format "${format.format}" contains a reserved "${DIGIT_PLACEHOLDER}" symbol for pattern ${format.pattern} for ${country_code}`)
					}
				}
			}

			if (country_code === '001') {
				nonGeographic[country.phone_code] = country
				// Populate numbering plan possible lengths.
				populateNumberingPlanPossibleLengths(country)
			} else {
				// Add this country's metadata
				// to the metadata map.
				countries[country_code] = country

				// Register this country's "country phone code"
				if (!country_calling_code_to_countries[country.phone_code]) {
					country_calling_code_to_countries[country.phone_code] = []
				}

				// In case of several countries
				// having the same country phone code.
				//
				// E.g. for USA and Canada, USA is the
				// "main country for phone code 1".
				//
				// (maybe this field is not used at all
				//  in which case this field is to be removed)
				//
				if (territory.$.mainCountryForCode === "true") {
					country_calling_code_to_countries[country.phone_code].unshift(country_code)
				} else {
					country_calling_code_to_countries[country.phone_code].push(country_code)
				}
			}
		}

		// Some countries don't have `availableFormats` specified,
		// because those formats are meant to be copied from the "main country for region":
		// all non-"main" countries inherit their formats from the "main" country for that region.
		// If that's the case then `nationalPrefixFormattingRule` and
		// `nationalPrefixOptionalWhenFormatting` are also copied from the "main" region.
		// `nationalPrefix` itself though seems to be always present
		// even if it's the same for the "main" region.
		// Examples: "RU" and "KZ", "US" and "CA".
		for (const country_code of Object.keys(countries))
		{
			const country = countries[country_code]

			const main_country_for_region_code = country_calling_code_to_countries[country.phone_code][0]

			if (main_country_for_region_code === country_code)
			{
				// Some countries like Saint Helena and Falkland Islands
				// ('AC', 'FK', 'KI', 'NU', 'SH', 'TA', ...)
				// don't have any phone number formats defined
				// and phone numbers are not formatted in those countries.
				if (!country.formats)
				{
					country.formats = []
				}
			}
			else
			{
				if (country.formats !== undefined) {
					throw new Error(`Country "${country_code}" is supposed to inherit formats from "${main_country_for_region_code}" but has its own formats defined.`)
				}
				if (country.national_prefix_formatting_rule !== undefined) {
					throw new Error(`Country "${country_code}" is supposed to inherit "national_prefix_formatting_rule" from "${main_country_for_region_code}" but has its own "national_prefix_formatting_rule" defined.`)
				}
				if (country.national_prefix_is_optional_when_formatting !== undefined) {
					throw new Error(`Country "${country_code}" is supposed to inherit "national_prefix_is_optional_when_formatting" from "${main_country_for_region_code}" but has its own "national_prefix_is_optional_when_formatting" defined.`)
				}
			}
		}

		// Turns out that `<generalDesc><nationalNumberPattern/></generalDesc>`
		// is not preemptive at all: it's too unspecific for the cases
		// when several countries correspond to the same country phone code
		// (e.g. NANPA: US, Canada, etc — all correspond to the same `1` country phone code).
		// For these cases all those bulky `<fixedLine/>`, `<mobile/>`, etc
		// patterns are required. Therefore retain them for these rare cases.
		//
		// This increases metadata size by 5 KiloBytes.
		//
		const visited_countries = {}
		for (const country_calling_code of Object.keys(country_calling_code_to_countries))
		{
			const country_codes = country_calling_code_to_countries[country_calling_code]

			for (const country_code of country_codes)
			{
				if (visited_countries[country_code])
				{
					continue
				}

				visited_countries[country_code] = true

				// Populate numbering plan possible lengths.
				populateNumberingPlanPossibleLengths(countries[country_code])

				if (countries[country_code].possible_lengths.length === 0) {
					throw new Error(`No "possibleLengths" set for country "${country_code}". "react-phone-number-input" relies on "possibleLengths" being always present.`)
				}
			}

			// Purge `types` regular expressions (they are huge)
			// when they're not needed for resolving country phone code
			// to country phone number matching.
			// E.g. when there's a one-to-one correspondence
			// between a country phone code and a country code
			const all_types_required = country_codes.length > 1

			if (!extended && !included_phone_number_types && !all_types_required)
			{
				delete countries[country_codes[0]].types
				continue
			}

			for (const country_code of country_codes)
			{
				// Leading digits for a country are sufficient
				// to resolve country phone code ambiguity.
				// So retaining all phone number type regular expressions
				// is not required in this case.
				if (!extended && !included_phone_number_types)
				{
					if (countries[country_code].leading_digits)
					{
						delete countries[country_code].types
						continue
					}
				}

				const types = countries[country_code].types

				// Find duplicate regular expressions for types
				// and just discard such duplicate types
				// to reduce metadata size (by 5 KiloBytes).
				// Or retain regular expressions just for the
				// specified phone number types (if configured).
				for (const _type of phone_number_types)
				{
					if (!types[_type])
					{
						continue
					}

					// Retain regular expressions just for the
					// specified phone number types (if configured).
					if (included_phone_number_types)
					{
						if (!all_types_required && !included_phone_number_types.has(_type))
						{
							delete types[_type]
						}
					}
					// Remove redundant types
					// (other types having the same regular expressions as this one)
					else
					{
						// Sometimes fixed line pattern is the same as for mobile.
						if (types.fixed_line && types.mobile &&
							types.fixed_line.pattern === types.mobile.pattern)
						{
							types.mobile.pattern = ''
						}
					}
				}
			}
		}

		return {
			version,
			countries,
			country_calling_codes: country_calling_code_to_countries,
			nonGeographic
		}
	})
}

// Replaces $NP with national prefix and $FG with the first group ($1)
function getNationalPrefixFormattingRule(rule, national_prefix) {
	if (!rule) {
		return
	}
	// Replace $NP with national prefix and $FG with the first group ($1)
	return rule
		.replace('$NP', national_prefix)
		.replace('$FG', '$1')
}

// Extracts various phone number type patterns from country XML metadata
function get_phone_number_types(territory)
{
	return phone_number_types.reduce((output, type) =>
	{
		const camel_cased_type = underscoreToCamelCase(type)
		const pattern = territory[camel_cased_type] && territory[camel_cased_type][0].nationalNumberPattern[0].replace(/\s/g, '')
		const possible_lengths = territory[camel_cased_type] && territory[camel_cased_type][0].possibleLengths[0].$.national
		const possible_lengths_local = territory[camel_cased_type] && territory[camel_cased_type][0].possibleLengths[0].$.localOnly

		if (pattern)
		{
			output[type] =
			{
				pattern,
				possible_lengths,
				// possible_lengths_local
			}
		}

		return output
	},
	{})
}

// Extracts various phone number type examples from country XML metadata
function get_phone_number_examples(territory) {
	return phone_number_types.reduce((output, type) => {
		const camel_cased_type = underscoreToCamelCase(type)
		const example = territory[camel_cased_type] && territory[camel_cased_type][0].exampleNumber[0]
		if (example) {
			output[type] = example
		}
		return output
	}, {})
}

function underscoreToCamelCase(string) {
	return string.replace(/(\_\w)/g, match => match[1].toUpperCase())
}

/**
* Parses a possible length string into a set of the integers that are covered.
*
* @param {string} possible_length_string - A string specifying the possible lengths of phone numbers. Follows
*     this syntax: ranges or elements are separated by commas, and ranges are specified in
*     [min-max] notation, inclusive. For example, [3-5],7,9,[11-14] should be parsed to
*     3,4,5,7,9,11,12,13,14.
* @return {Set}
*/
function parse_possible_lengths(possible_length_string)
{
	if (possible_length_string.length === 0)
	{
		throw new TypeError('Empty possibleLength string found.')
	}

	const lengths = new Set()

	for (const length of possible_length_string.split(','))
	{
		if (length.length == 0)
		{
			throw new TypeError(`Leading, trailing or adjacent commas in possible length string ${length}, these should only separate numbers or ranges.`)
		}

		if (length[0] === '[')
		{
			if (length[length.length - 1] !== ']')
			{
				throw new TypeError(`Missing end of range character in possible length string ${length}.`)
			}

			// Strip the leading and trailing [], and split on the -.
			const min_max = length.slice(1, length.length - 1).split('-').map(_ => parseInt(_))

			if (min_max.length !== 2)
			{
				throw new TypeError(`Ranges must have exactly one - character: missing for ${length}.`)
			}

			const [min, max] = min_max

			// We don't even accept [6-7] since we prefer the shorter 6,7 variant;
			// for a range to be in use the hyphen needs to replace at least one digit.
			if (max - min < 2)
			{
				throw new TypeError(`The first number in a range should be two or more digits lower than the second. Culprit possibleLength string: ${length}`)
			}

			for (let i = min; i <= max; i++)
			{
				if (lengths.has(i))
				{
					throw new TypeError(`Duplicate length element found (${i}) in possibleLength string ${length}.`)
				}

				lengths.add(i)
			}
		}
		else
		{
			const i = parseInt(length)

			if (lengths.has(i))
			{
				throw new TypeError(`Duplicate length element found (${i}) in possibleLength string ${length}.`)
			}

			lengths.add(i)
		}
	}

	return lengths
}

const arrays_are_equal = (a1, a2) => a1.length === a2.length && a1.every((_, i) => _ === a2[i])

/**
 * Sets `metadata.possible_lengths` to a combination of `possible_length`s
 * of all types present in the numbering plan metadata.
 * @param  {object} metadata
 */
function populateNumberingPlanPossibleLengths(metadata)
{
	const types = metadata.types

	const possible_lengths = new Set()
	const possible_lengths_local = new Set()

	for (const _type of Object.keys(types))
	{
		const type_possible_lengths = parse_possible_lengths(types[_type].possible_lengths)

		for (const i of type_possible_lengths)
		{
			possible_lengths.add(i)
		}

		types[_type].possible_lengths = Array.from(type_possible_lengths)

		if (types[_type].possible_lengths_local)
		{
			const type_possible_lengths_local = parse_possible_lengths(types[_type].possible_lengths_local)

			for (const i of type_possible_lengths_local)
			{
				possible_lengths_local.add(i)
			}

			types[_type].possible_lengths_local = Array.from(type_possible_lengths_local)
		}
	}

	for (const i of possible_lengths_local)
	{
		if (possible_lengths.has(i))
		{
			possible_lengths_local.delete(i)
		}
	}

	metadata.possible_lengths = Array.from(possible_lengths)
	metadata.possible_lengths.sort((a, b) => a - b)

	if (possible_lengths_local.size > 0)
	{
		metadata.possible_lengths_local = Array.from(possible_lengths_local)
		metadata.possible_lengths_local.sort((a, b) => a - b)
	}

	// Remove duplicates.
	for (const _type of Object.keys(types))
	{
		if (arrays_are_equal(types[_type].possible_lengths, metadata.possible_lengths))
		{
			delete types[_type].possible_lengths
		}

		if (types[_type].possible_lengths_local && metadata.possible_lengths_local &&
			arrays_are_equal(types[_type].possible_lengths_local, metadata.possible_lengths_local))
		{
			delete types[_type].possible_lengths_local
		}
	}
}

function parseStringPromisified(input) {
	return new Promise((resolve, reject) => {
		parseString(input, (error, result) => {
			if (error) {
				return reject(error)
			}
			resolve(result)
		})
	})
}