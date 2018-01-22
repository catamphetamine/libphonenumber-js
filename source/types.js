import parse, { is_viable_phone_number } from './parse'

import { matches_entirely } from './common'

import
{
	get_national_number_pattern,
	get_type_fixed_line,
	get_type_mobile,
	get_type_toll_free,
	get_type_premium_rate,
	get_type_personal_number,
	get_type_voice_mail,
	get_type_uan,
	get_type_pager,
	get_type_voip,
	get_type_shared_cost
}
from './metadata'

// Finds out national phone number type (fixed line, mobile, etc)
export default function get_number_type(arg_1, arg_2, arg_3)
{
	const { input, metadata } = sort_out_arguments(arg_1, arg_2, arg_3)

	// When no input was passed
	if (!input)
	{
		return
	}

	// When `parse()` returned `{}`
	// meaning that the phone number is not a valid one.
	if (!input.country)
	{
		return
	}

	const national_number = input.phone
	const country_metadata = metadata.countries[input.country]

	// The following is copy-pasted from the original function:
	// https://github.com/googlei18n/libphonenumber/blob/3ea547d4fbaa2d0b67588904dfa5d3f2557c27ff/javascript/i18n/phonenumbers/phonenumberutil.js#L2835

	// Is this national number even valid for this country
	if (!is_of_type(national_number, get_national_number_pattern(country_metadata)))
	{
		return // 'UNKNOWN'
	}

	if (is_of_type(national_number, get_type_premium_rate(country_metadata)))
	{
		return 'PREMIUM_RATE'
	}

	if (is_of_type(national_number, get_type_toll_free(country_metadata)))
	{
		return 'TOLL_FREE'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_shared_cost(country_metadata)))
	{
		return 'SHARED_COST'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_voip(country_metadata)))
	{
		return 'VOIP'
	}

	if (is_of_type(national_number, get_type_personal_number(country_metadata)))
	{
		return 'PERSONAL_NUMBER'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_pager(country_metadata)))
	{
		return 'PAGER'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_uan(country_metadata)))
	{
		return 'UAN'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_voice_mail(country_metadata)))
	{
		return 'VOICEMAIL'
	}

	// Is it fixed line number
	if (is_of_type(national_number, get_type_fixed_line(country_metadata)))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if there's no "mobile" pattern
		// then it means it was removed due to being a duplicate of some other pattern.
		//
		if (!get_type_mobile(country_metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		// Check if the number happens to qualify as both fixed line and mobile.
		// (no such country in the minimal metadata set)
		/* istanbul ignore if */
		if (is_of_type(national_number, get_type_mobile(country_metadata)))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'FIXED_LINE'
	}

	if (is_of_type(national_number, get_type_mobile(country_metadata)))
	{
		return 'MOBILE'
	}

	// return 'UNKNOWN'
}

export function is_of_type(national_number, type)
{
	// // Check if any possible number lengths are present;
	// // if so, we use them to avoid checking
	// // the validation pattern if they don't match.
	// // If they are absent, this means they match
	// // the general description, which we have
	// // already checked before a specific number type.
	// if (get_possible_lengths(type) &&
	// 	get_possible_lengths(type).indexOf(national_number.length) === -1)
	// {
	// 	return false
	// }

	// get_type_pattern(type) === type
	return matches_entirely(national_number, type)
}

// Sort out arguments
export function sort_out_arguments(arg_1, arg_2, arg_3)
{
	let input
	let metadata

	// Normalize numerical `value`.
	// https://github.com/catamphetamine/libphonenumber-js/issues/142
	// `getNumberType(88005553535, ...)`.
	// This is for legacy databases only
	// because integers must not be used to represent phone numbers.
	// https://github.com/googlei18n/libphonenumber/blob/master/FALSEHOODS.md
	if (typeof arg_1 === 'number')
	{
		arg_1 = String(arg_1)
	}

	// If the phone number is passed as a string.
	// `getNumberType('88005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		// If "resrict country" argument is being passed
		// then convert it to an `options` object.
		// `getNumberType('88005553535', 'RU', metadata)`.
		if (typeof arg_2 === 'string' || arg_2 === undefined)
		{
			metadata = arg_3

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(arg_1))
			{
				input = parse(arg_1, arg_2, metadata)
			}
		}
		// No "resrict country" argument is being passed.
		// International phone number is passed.
		// `getNumberType('+78005553535', metadata)`.
		else
		{
			metadata = arg_2

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(arg_1))
			{
				input = parse(arg_1, metadata)
			}
		}
	}
	// If the phone number is passed as a parsed phone number.
	// `getNumberType({ phone: '88005553535', country: 'RU' }, ...)`.
	else
	{
		// The `arg_1` must be a valid phone number
		// as a whole, not just a part of it which gets parsed here.
		if (arg_1 && arg_1.phone && is_viable_phone_number(arg_1.phone))
		{
			input = arg_1
		}

		metadata = arg_2
	}

	// Metadata is required.
	if (!metadata || !metadata.countries)
	{
		throw new Error('Metadata is required')
	}

	return { input, metadata }
}