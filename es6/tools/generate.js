var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import { parseString } from 'xml2js';

import { DIGIT_PLACEHOLDER } from '../AsYouType';
// import { isSingleIDDPrefix } from '../IDD'

var phone_number_types = ['premium_rate', 'toll_free', 'shared_cost', 'voip', 'personal_number', 'pager', 'uan', 'voice_mail', 'fixed_line', 'mobile'];

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
export default function (input, version, included_countries, extended, included_phone_number_types) {
	// Validate `included_phone_number_types`
	if (included_phone_number_types) {
		for (var _iterator = included_phone_number_types, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref;

			if (_isArray) {
				if (_i >= _iterator.length) break;
				_ref = _iterator[_i++];
			} else {
				_i = _iterator.next();
				if (_i.done) break;
				_ref = _i.value;
			}

			var _type = _ref;

			if (phone_number_types.indexOf(_type) < 0) {
				return Promise.reject('Unknown phone number type: ' + _type);
			}
		}
	}

	// Parse the XML metadata
	return parseStringPromisified(input).then(function (xml) {
		// https://github.com/googlei18n/libphonenumber/blob/master/resources/PhoneNumberMetadata.xml
		// https://github.com/googlei18n/libphonenumber/blob/master/resources/phonemetadata.proto
		// https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js
		// https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/asyoutypeformatter.js

		var country_calling_code_to_countries = {};
		var countries = {};

		var _loop = function _loop() {
			if (_isArray2) {
				if (_i2 >= _iterator2.length) return 'break';
				_ref2 = _iterator2[_i2++];
			} else {
				_i2 = _iterator2.next();
				if (_i2.done) return 'break';
				_ref2 = _i2.value;
			}

			var territory = _ref2;

			// A two-letter country code
			var country_code = territory.$.id;

			// Skip this country if it has not been explicitly included
			if (included_countries && !included_countries.has(country_code)) {
				return 'continue';
			}

			// Country metadata
			var country = {
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
				national_prefix_for_parsing: territory.$.nationalPrefixForParsing ? territory.$.nationalPrefixForParsing.replace(/\s/g, '') : undefined,

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
				// (e.g. 0343 15 555 1212 is exactly the same number as +54 9 343 555 1212).
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
				national_prefix_formatting_rule: national_prefix_formatting_rule(territory.$.nationalPrefixFormattingRule, territory.$.nationalPrefix),

				// Is it possible that a national (significant)
				// phone number has leading zeroes?
				//
				// E.g. in Gabon some numbers start with a `0`
				// while the national prefix is also `0`
				// which is optional for mobile numbers.
				//
				national_prefix_is_optional_when_formatting: territory.$.nationalPrefixOptionalWhenFormatting ? Boolean(territory.$.nationalPrefixOptionalWhenFormatting) : undefined,

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

				// Check that national (significant) phone number pattern
				// is set for this country (no "default" value here)
			};if (!country.national_number_pattern) {
				throw new Error('"generalDesc.nationalNumberPattern" is missing for country ' + country_code + ' metadata');
			}

			// Check that an IDD prefix is always defined.
			if (country_code !== '001' && !country.idd_prefix) {
				throw new Error('"generalDesc.internationalPrefix" is missing for country ' + country_code + ' metadata');
			}

			// // Check that a preferred IDD prefix is always defined if IDD prefix is a pattern.
			// if (country_code !== '001' && !isSingleIDDPrefix(country.idd_prefix) && !country.default_idd_prefix)
			// {
			// 	throw new Error(`"generalDesc.preferredInternationalPrefix" is missing for country ${country_code} metadata`)
			// }

			// Some countries don't have `availableFormats` specified,
			// because those formats are inherited from the "main country for region".
			if (territory.availableFormats) {
				country.formats = territory.availableFormats[0].numberFormat.map(function (number_format) {
					return {
						pattern: number_format.$.pattern,
						leading_digits_patterns: number_format.leadingDigits ? number_format.leadingDigits.map(function (leading_digits) {
							return leading_digits.replace(/\s/g, '');
						}) : undefined,
						national_prefix_formatting_rule: national_prefix_formatting_rule(number_format.$.nationalPrefixFormattingRule, territory.$.nationalPrefix),
						national_prefix_is_optional_when_formatting: number_format.$.nationalPrefixOptionalWhenFormatting ? Boolean(number_format.$.nationalPrefixOptionalWhenFormatting) : undefined,
						format: number_format.format[0],
						international_format: number_format.intlFormat ? number_format.intlFormat[0] : undefined
					};
				})
				// Screw local-only formats
				.filter(function (format) {
					return format.international_format !== 'NA';
				});

				// Sanity check (using no "default" for this field)
				for (var _iterator8 = country.formats, _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
					var _ref8;

					if (_isArray8) {
						if (_i8 >= _iterator8.length) break;
						_ref8 = _iterator8[_i8++];
					} else {
						_i8 = _iterator8.next();
						if (_i8.done) break;
						_ref8 = _i8.value;
					}

					var format = _ref8;

					// Never happens
					if (!format.format) {
						throw new Error('No phone number format "format" supplied for pattern ' + format.pattern + ' for ' + country_code);
					}

					// Never happens
					if (format.format.indexOf(DIGIT_PLACEHOLDER) >= 0) {
						throw new Error('Phone number format "' + format.format + '" contains a reserved "' + DIGIT_PLACEHOLDER + '" symbol for pattern ' + format.pattern + ' for ' + country_code);
					}
				}
			}

			// Add this country's metadata
			// to the metadata map.
			countries[country_code] = country;

			// Register this country's "country phone code"

			if (!country_calling_code_to_countries[country.phone_code]) {
				country_calling_code_to_countries[country.phone_code] = [];
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
				country_calling_code_to_countries[country.phone_code].unshift(country_code);
			} else {
				country_calling_code_to_countries[country.phone_code].push(country_code);
			}
		};

		_loop2: for (var _iterator2 = xml.phoneNumberMetadata.territories[0].territory, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
			var _ref2;

			var _ret = _loop();

			switch (_ret) {
				case 'break':
					break _loop2;

				case 'continue':
					continue;}
		}

		// Some countries don't have `availableFormats` specified,
		// because those formats are meant to be copied
		// from the "main country for region".


		for (var _iterator3 = Object.keys(countries), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
			var _ref3;

			if (_isArray3) {
				if (_i3 >= _iterator3.length) break;
				_ref3 = _iterator3[_i3++];
			} else {
				_i3 = _iterator3.next();
				if (_i3.done) break;
				_ref3 = _i3.value;
			}

			var _country_code = _ref3;

			var _country = countries[_country_code];

			var main_country_for_region_code = country_calling_code_to_countries[_country.phone_code][0];
			var main_country_for_region = countries[main_country_for_region_code];
			_country.formats = main_country_for_region.formats;

			// Some countries like Saint Helena and Falkland Islands
			// ('AC', 'FK', 'KI', 'NU', 'SH', 'TA', ...)
			// don't have any phone number formats
			// and phone numbers are formatted as a block in those countries.
			if (!_country.formats) {
				_country.formats = [];
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
		var visited_countries = {};
		for (var _iterator4 = Object.keys(country_calling_code_to_countries), _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
			var _ref4;

			if (_isArray4) {
				if (_i4 >= _iterator4.length) break;
				_ref4 = _iterator4[_i4++];
			} else {
				_i4 = _iterator4.next();
				if (_i4.done) break;
				_ref4 = _i4.value;
			}

			var country_calling_code = _ref4;

			var country_codes = country_calling_code_to_countries[country_calling_code];

			for (var _iterator5 = country_codes, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
				var _ref5;

				if (_isArray5) {
					if (_i5 >= _iterator5.length) break;
					_ref5 = _iterator5[_i5++];
				} else {
					_i5 = _iterator5.next();
					if (_i5.done) break;
					_ref5 = _i5.value;
				}

				var _country_code2 = _ref5;

				if (visited_countries[_country_code2]) {
					continue;
				}

				visited_countries[_country_code2] = true;

				// Populate possible lengths
				populate_possible_lengths(countries[_country_code2]);
			}

			// Purge `types` regular expressions (they are huge)
			// when they're not needed for resolving country phone code
			// to country phone number matching.
			// E.g. when there's a one-to-one correspondence
			// between a country phone code and a country code
			var all_types_required = country_codes.length > 1;

			if (!extended && !included_phone_number_types && !all_types_required) {
				delete countries[country_codes[0]].types;
				continue;
			}

			for (var _iterator6 = country_codes, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
				var _ref6;

				if (_isArray6) {
					if (_i6 >= _iterator6.length) break;
					_ref6 = _iterator6[_i6++];
				} else {
					_i6 = _iterator6.next();
					if (_i6.done) break;
					_ref6 = _i6.value;
				}

				var _country_code3 = _ref6;

				// Leading digits for a country are sufficient
				// to resolve country phone code ambiguity.
				// So retaining all phone number type regular expressions
				// is not required in this case.
				if (!extended && !included_phone_number_types) {
					if (countries[_country_code3].leading_digits) {
						delete countries[_country_code3].types;
						continue;
					}
				}

				var types = countries[_country_code3].types;

				// Find duplicate regular expressions for types
				// and just discard such duplicate types
				// to reduce metadata size (by 5 KiloBytes).
				// Or retain regular expressions just for the
				// specified phone number types (if configured).
				for (var _iterator7 = phone_number_types, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
					var _ref7;

					if (_isArray7) {
						if (_i7 >= _iterator7.length) break;
						_ref7 = _iterator7[_i7++];
					} else {
						_i7 = _iterator7.next();
						if (_i7.done) break;
						_ref7 = _i7.value;
					}

					var _type2 = _ref7;

					if (!types[_type2]) {
						continue;
					}

					// Retain regular expressions just for the
					// specified phone number types (if configured).
					if (included_phone_number_types) {
						if (!all_types_required && !included_phone_number_types.has(_type2)) {
							delete types[_type2];
						}
					}
					// Remove redundant types
					// (other types having the same regular expressions as this one)
					else {
							// Sometimes fixed line pattern is the same as for mobile.
							if (types.fixed_line && types.mobile && types.fixed_line.pattern === types.mobile.pattern) {
								types.mobile.pattern = '';
							}
						}
				}
			}
		}

		return {
			version: version,
			countries: countries,
			country_calling_codes: country_calling_code_to_countries
		};
	});
}

// Replaces $NP with national prefix and $FG with the first group ($1)
function national_prefix_formatting_rule(rule, national_prefix) {
	if (!rule) {
		return;
	}

	// Replace $NP with national prefix and $FG with the first group ($1)
	return rule.replace('$NP', national_prefix).replace('$FG', '$1');
}

// Extracts various phone number type patterns from country XML metadata
function get_phone_number_types(territory) {
	return phone_number_types.reduce(function (output, type) {
		var camel_cased_type = underscore_to_camel_case(type);
		var pattern = territory[camel_cased_type] && territory[camel_cased_type][0].nationalNumberPattern[0].replace(/\s/g, '');
		var possible_lengths = territory[camel_cased_type] && territory[camel_cased_type][0].possibleLengths[0].$.national;
		var possible_lengths_local = territory[camel_cased_type] && territory[camel_cased_type][0].possibleLengths[0].$.localOnly;

		if (pattern) {
			output[type] = {
				pattern: pattern,
				possible_lengths: possible_lengths
				// possible_lengths_local
			};
		}

		return output;
	}, {});
}

// Extracts various phone number type examples from country XML metadata
function get_phone_number_examples(territory) {
	return phone_number_types.reduce(function (output, type) {
		var camel_cased_type = underscore_to_camel_case(type);
		var example = territory[camel_cased_type] && territory[camel_cased_type][0].exampleNumber[0];

		if (example) {
			output[type] = example;
		}

		return output;
	}, {});
}

function underscore_to_camel_case(string) {
	return string.replace(/(\_\w)/g, function (match) {
		return match[1].toUpperCase();
	});
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
function parse_possible_lengths(possible_length_string) {
	if (possible_length_string.length === 0) {
		throw new TypeError('Empty possibleLength string found.');
	}

	var lengths = new Set();

	for (var _iterator9 = possible_length_string.split(','), _isArray9 = Array.isArray(_iterator9), _i9 = 0, _iterator9 = _isArray9 ? _iterator9 : _iterator9[Symbol.iterator]();;) {
		var _ref9;

		if (_isArray9) {
			if (_i9 >= _iterator9.length) break;
			_ref9 = _iterator9[_i9++];
		} else {
			_i9 = _iterator9.next();
			if (_i9.done) break;
			_ref9 = _i9.value;
		}

		var length = _ref9;

		if (length.length == 0) {
			throw new TypeError('Leading, trailing or adjacent commas in possible length string ' + length + ', these should only separate numbers or ranges.');
		}

		if (length[0] === '[') {
			if (length[length.length - 1] !== ']') {
				throw new TypeError('Missing end of range character in possible length string ' + length + '.');
			}

			// Strip the leading and trailing [], and split on the -.
			var min_max = length.slice(1, length.length - 1).split('-').map(function (_) {
				return parseInt(_);
			});

			if (min_max.length !== 2) {
				throw new TypeError('Ranges must have exactly one - character: missing for ' + length + '.');
			}

			var _min_max = _slicedToArray(min_max, 2),
			    min = _min_max[0],
			    max = _min_max[1];

			// We don't even accept [6-7] since we prefer the shorter 6,7 variant;
			// for a range to be in use the hyphen needs to replace at least one digit.


			if (max - min < 2) {
				throw new TypeError('The first number in a range should be two or more digits lower than the second. Culprit possibleLength string: ' + length);
			}

			for (var i = min; i <= max; i++) {
				if (lengths.has(i)) {
					throw new TypeError('Duplicate length element found (' + i + ') in possibleLength string ' + length + '.');
				}

				lengths.add(i);
			}
		} else {
			var _i10 = parseInt(length);

			if (lengths.has(_i10)) {
				throw new TypeError('Duplicate length element found (' + _i10 + ') in possibleLength string ' + length + '.');
			}

			lengths.add(_i10);
		}
	}

	return lengths;
}

var arrays_are_equal = function arrays_are_equal(a1, a2) {
	return a1.length === a2.length && a1.every(function (_, i) {
		return _ === a2[i];
	});
};

function populate_possible_lengths(metadata) {
	var types = metadata.types;

	var possible_lengths = new Set();
	var possible_lengths_local = new Set();

	for (var _iterator10 = Object.keys(types), _isArray10 = Array.isArray(_iterator10), _i11 = 0, _iterator10 = _isArray10 ? _iterator10 : _iterator10[Symbol.iterator]();;) {
		var _ref10;

		if (_isArray10) {
			if (_i11 >= _iterator10.length) break;
			_ref10 = _iterator10[_i11++];
		} else {
			_i11 = _iterator10.next();
			if (_i11.done) break;
			_ref10 = _i11.value;
		}

		var _type = _ref10;

		var type_possible_lengths = parse_possible_lengths(types[_type].possible_lengths);

		for (var _iterator13 = type_possible_lengths, _isArray13 = Array.isArray(_iterator13), _i14 = 0, _iterator13 = _isArray13 ? _iterator13 : _iterator13[Symbol.iterator]();;) {
			var _ref13;

			if (_isArray13) {
				if (_i14 >= _iterator13.length) break;
				_ref13 = _iterator13[_i14++];
			} else {
				_i14 = _iterator13.next();
				if (_i14.done) break;
				_ref13 = _i14.value;
			}

			var _i16 = _ref13;

			possible_lengths.add(_i16);
		}

		types[_type].possible_lengths = Array.from(type_possible_lengths);

		if (types[_type].possible_lengths_local) {
			var type_possible_lengths_local = parse_possible_lengths(types[_type].possible_lengths_local);

			for (var _iterator14 = type_possible_lengths_local, _isArray14 = Array.isArray(_iterator14), _i15 = 0, _iterator14 = _isArray14 ? _iterator14 : _iterator14[Symbol.iterator]();;) {
				var _ref14;

				if (_isArray14) {
					if (_i15 >= _iterator14.length) break;
					_ref14 = _iterator14[_i15++];
				} else {
					_i15 = _iterator14.next();
					if (_i15.done) break;
					_ref14 = _i15.value;
				}

				var i = _ref14;

				possible_lengths_local.add(i);
			}

			types[_type].possible_lengths_local = Array.from(type_possible_lengths_local);
		}
	}

	for (var _iterator11 = possible_lengths_local, _isArray11 = Array.isArray(_iterator11), _i12 = 0, _iterator11 = _isArray11 ? _iterator11 : _iterator11[Symbol.iterator]();;) {
		var _ref11;

		if (_isArray11) {
			if (_i12 >= _iterator11.length) break;
			_ref11 = _iterator11[_i12++];
		} else {
			_i12 = _iterator11.next();
			if (_i12.done) break;
			_ref11 = _i12.value;
		}

		var _i17 = _ref11;

		if (possible_lengths.has(_i17)) {
			possible_lengths_local.delete(_i17);
		}
	}

	metadata.possible_lengths = Array.from(possible_lengths);
	metadata.possible_lengths.sort(function (a, b) {
		return a - b;
	});

	if (possible_lengths_local.size > 0) {
		metadata.possible_lengths_local = Array.from(possible_lengths_local);
		metadata.possible_lengths_local.sort(function (a, b) {
			return a - b;
		});
	}

	// Remove duplicates.
	for (var _iterator12 = Object.keys(types), _isArray12 = Array.isArray(_iterator12), _i13 = 0, _iterator12 = _isArray12 ? _iterator12 : _iterator12[Symbol.iterator]();;) {
		var _ref12;

		if (_isArray12) {
			if (_i13 >= _iterator12.length) break;
			_ref12 = _iterator12[_i13++];
		} else {
			_i13 = _iterator12.next();
			if (_i13.done) break;
			_ref12 = _i13.value;
		}

		var _type3 = _ref12;

		if (arrays_are_equal(types[_type3].possible_lengths, metadata.possible_lengths)) {
			delete types[_type3].possible_lengths;
		}

		if (types[_type3].possible_lengths_local && metadata.possible_lengths_local && arrays_are_equal(types[_type3].possible_lengths_local, metadata.possible_lengths_local)) {
			delete types[_type3].possible_lengths_local;
		}
	}
}

function parseStringPromisified(input) {
	return new Promise(function (resolve, reject) {
		parseString(input, function (error, result) {
			if (error) {
				return reject(error);
			}
			resolve(result);
		});
	});
}
//# sourceMappingURL=generate.js.map