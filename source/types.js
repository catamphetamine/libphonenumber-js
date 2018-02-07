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
	get_type_shared_cost,
	get_type_pattern,
	get_type_possible_lengths,
	get_country_phone_number_possible_lengths,
	// get_country_phone_number_possible_lengths_local
}
from './metadata'

const non_fixed_line_types =
[
	'MOBILE',
	'PREMIUM_RATE',
	'TOLL_FREE',
	'SHARED_COST',
	'VOIP',
	'PERSONAL_NUMBER',
	'PAGER',
	'UAN',
	'VOICEMAIL'
]

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
	if (!matches_entirely(national_number, get_national_number_pattern(country_metadata)))
	{
		return
	}

	// Is it fixed line number
	if (is_of_type(national_number, 'FIXED_LINE', country_metadata))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if "mobile" pattern is ""
		// then it means it was removed due to being a duplicate of the fixed-line pattern.
		//
		if (get_type_mobile(country_metadata) &&
			get_type_pattern(get_type_mobile(country_metadata)) === '')
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		// Check if the number happens to qualify as both fixed line and mobile.
		// (no such country in the minimal metadata set)
		/* istanbul ignore if */
		if (is_of_type(national_number, 'MOBILE', country_metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'FIXED_LINE'
	}

	for (const _type of non_fixed_line_types)
	{
		if (is_of_type(national_number, _type, country_metadata))
		{
			return _type
		}
	}
}

export function is_of_type(national_number, type, metadata)
{
	type = get_type_info(type, metadata)

	if (!type || !get_type_pattern(type))
	{
		return false
	}

	// Check if any possible number lengths are present;
	// if so, we use them to avoid checking
	// the validation pattern if they don't match.
	// If they are absent, this means they match
	// the general description, which we have
	// already checked before a specific number type.
	if (get_type_possible_lengths(type) &&
		get_type_possible_lengths(type).indexOf(national_number.length) < 0)
	{
		return false
	}

	return matches_entirely(national_number, get_type_pattern(type))
}

// Sort out arguments
export function sort_out_arguments(arg_1, arg_2, arg_3)
{
	let input
	let metadata

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
	else if (is_object(arg_1) && typeof arg_1.phone === 'string')
	{
		// The `arg_1` must be a valid phone number
		// as a whole, not just a part of it which gets parsed here.
		if (is_viable_phone_number(arg_1.phone))
		{
			input = arg_1
		}

		metadata = arg_2
	}
	else throw new TypeError('A phone number must either be a string or an object of shape { phone, [country] }.')

	// Metadata is required.
	if (!metadata || !metadata.countries)
	{
		throw new Error('Metadata is required')
	}

	return { input, metadata }
}

export function check_number_length_for_type(national_number, type, metadata)
{
	const type_info = get_type_info(type, metadata)

	// There should always be "<possiblePengths/>" set for every type element.
	// This is declared in the XML schema.
	// For size efficiency, where a sub-description (e.g. fixed-line)
	// has the same "<possiblePengths/>" as the "general description", this is missing,
	// so we fall back to the "general description". Where no numbers of the type
	// exist at all, there is one possible length (-1) which is guaranteed
	// not to match the length of any real phone number.
	let possible_lengths = type_info && get_type_possible_lengths(type_info) || get_country_phone_number_possible_lengths(metadata)
	// let local_lengths    = type_info && get_type_possible_lengths_local(type_info) || get_country_phone_number_possible_lengths_local(metadata)

	if (type === 'FIXED_LINE_OR_MOBILE')
	{
		// No such country in metadata.
		/* istanbul ignore next */
		if (!get_type_fixed_line(metadata))
		{
			// The rare case has been encountered where no fixedLine data is available
			// (true for some non-geographical entities), so we just check mobile.
			return test_number_length_for_type(national_number, 'MOBILE', metadata)
		}

		const mobile_type = get_type_mobile(metadata)

		if (mobile_type)
		{
			// Merge the mobile data in if there was any. "Concat" creates a new
			// array, it doesn't edit possible_lengths in place, so we don't need a copy.
			// Note that when adding the possible lengths from mobile, we have
			// to again check they aren't empty since if they are this indicates
			// they are the same as the general desc and should be obtained from there.
			possible_lengths = merge_arrays(possible_lengths, get_type_possible_lengths(mobile_type) || get_country_phone_number_possible_lengths(metadata))
			// The current list is sorted; we need to merge in the new list and
			// re-sort (duplicates are okay). Sorting isn't so expensive because
			// the lists are very small.

			// if (local_lengths)
			// {
			// 	local_lengths = merge_arrays(local_lengths, get_type_possible_lengths_local(mobile_type) || get_country_phone_number_possible_lengths_local(metadata))
			// }
			// else
			// {
			// 	local_lengths = get_type_possible_lengths_local(mobile_type)
			// }
		}
	}
	// If the type doesn't exist then return 'INVALID_LENGTH'.
	else if (type && !type_info)
	{
		return 'INVALID_LENGTH'
	}

	const actual_length = national_number.length

	// // This is safe because there is never an overlap beween the possible lengths
	// // and the local-only lengths; this is checked at build time.
	// if (local_lengths && local_lengths.indexOf(national_number.length) >= 0)
	// {
	// 	return 'IS_POSSIBLE_LOCAL_ONLY'
	// }

	const minimum_length = possible_lengths[0]

	if (minimum_length === actual_length)
	{
		return 'IS_POSSIBLE'
	}

	if (minimum_length > actual_length)
	{
		return 'TOO_SHORT'
	}

	if (possible_lengths[possible_lengths.length - 1] < actual_length)
	{
		return 'TOO_LONG'
	}

	// We skip the first element since we've already checked it.
	return possible_lengths.indexOf(actual_length, 1) >= 0 ? 'IS_POSSIBLE' : 'INVALID_LENGTH'
}

function get_type_info(type, metadata)
{
	switch (type)
	{
		case 'FIXED_LINE':
			return get_type_fixed_line(metadata)
		case 'MOBILE':
			return get_type_mobile(metadata)
		case 'PREMIUM_RATE':
			return get_type_premium_rate(metadata)
		case 'TOLL_FREE':
			return get_type_toll_free(metadata)
		case 'SHARED_COST':
			return get_type_shared_cost(metadata)
		case 'VOIP':
			return get_type_voip(metadata)
		case 'PERSONAL_NUMBER':
			return get_type_personal_number(metadata)
		case 'PAGER':
			return get_type_pager(metadata)
		case 'UAN':
			return get_type_uan(metadata)
		case 'VOICEMAIL':
			return get_type_voice_mail(metadata)
		// default:
		// 	throw new Error(`Unknown phone number type: ${type}`)
	}
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const is_object = _ => typeof _ === 'object'

function merge_arrays(a, b)
{
	let merged = new Set(a)

	for (const i of b)
	{
		merged.add(i)
	}

	merged = Array.from(merged)
	merged.sort((a, b) => a - b)
	return merged
}