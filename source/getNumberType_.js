import Metadata from './metadata'
import { matchesEntirely, mergeArrays } from './util'

const NON_FIXED_LINE_PHONE_TYPES =
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
export default function getNumberType(input, options, metadata)
{
	// If assigning the `{}` default value is moved to the arguments above,
	// code coverage would decrease for some weird reason.
	options = options || {}

	// When `parse()` returned `{}`
	// meaning that the phone number is not a valid one.
	if (!input.country) {
		return
	}

	metadata = new Metadata(metadata)

	metadata.selectNumberingPlan(input.country, input.countryCallingCode)

	const nationalNumber = options.v2 ? input.nationalNumber : input.phone

	// The following is copy-pasted from the original function:
	// https://github.com/googlei18n/libphonenumber/blob/3ea547d4fbaa2d0b67588904dfa5d3f2557c27ff/javascript/i18n/phonenumbers/phonenumberutil.js#L2835

	// Is this national number even valid for this country
	if (!matchesEntirely(nationalNumber, metadata.nationalNumberPattern()))
	{
		return
	}

	// Is it fixed line number
	if (is_of_type(nationalNumber, 'FIXED_LINE', metadata))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if "mobile" pattern is ""
		// then it means it was removed due to being a duplicate of the fixed-line pattern.
		//
		if (metadata.type('MOBILE') && metadata.type('MOBILE').pattern() === '')
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		// v1 metadata.
		// Legacy.
		// Deprecated.
		if (!metadata.type('MOBILE'))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		// Check if the number happens to qualify as both fixed line and mobile.
		// (no such country in the minimal metadata set)
		/* istanbul ignore if */
		if (is_of_type(nationalNumber, 'MOBILE', metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'FIXED_LINE'
	}

	for (const _type of NON_FIXED_LINE_PHONE_TYPES)
	{
		if (is_of_type(nationalNumber, _type, metadata))
		{
			return _type
		}
	}
}

export function is_of_type(nationalNumber, type, metadata)
{
	type = metadata.type(type)

	if (!type || !type.pattern())
	{
		return false
	}

	// Check if any possible number lengths are present;
	// if so, we use them to avoid checking
	// the validation pattern if they don't match.
	// If they are absent, this means they match
	// the general description, which we have
	// already checked before a specific number type.
	if (type.possibleLengths() &&
		type.possibleLengths().indexOf(nationalNumber.length) < 0)
	{
		return false
	}

	return matchesEntirely(nationalNumber, type.pattern())
}

// Should only be called for the "new" metadata which has "possible lengths".
export function checkNumberLengthForType(nationalNumber, type, metadata)
{
	const type_info = metadata.type(type)

	// There should always be "<possiblePengths/>" set for every type element.
	// This is declared in the XML schema.
	// For size efficiency, where a sub-description (e.g. fixed-line)
	// has the same "<possiblePengths/>" as the "general description", this is missing,
	// so we fall back to the "general description". Where no numbers of the type
	// exist at all, there is one possible length (-1) which is guaranteed
	// not to match the length of any real phone number.
	let possible_lengths = type_info && type_info.possibleLengths() || metadata.possibleLengths()
	// let local_lengths    = type_info && type.possibleLengthsLocal() || metadata.possibleLengthsLocal()

	// Metadata before version `1.0.18` didn't contain `possible_lengths`.
	if (!possible_lengths) {
		return 'IS_POSSIBLE'
	}

	if (type === 'FIXED_LINE_OR_MOBILE')
	{
		// No such country in metadata.
		/* istanbul ignore next */
		if (!metadata.type('FIXED_LINE'))
		{
			// The rare case has been encountered where no fixedLine data is available
			// (true for some non-geographic entities), so we just check mobile.
			return checkNumberLengthForType(nationalNumber, 'MOBILE', metadata)
		}

		const mobile_type = metadata.type('MOBILE')

		if (mobile_type)
		{
			// Merge the mobile data in if there was any. "Concat" creates a new
			// array, it doesn't edit possible_lengths in place, so we don't need a copy.
			// Note that when adding the possible lengths from mobile, we have
			// to again check they aren't empty since if they are this indicates
			// they are the same as the general desc and should be obtained from there.
			possible_lengths = mergeArrays(possible_lengths, mobile_type.possibleLengths())
			// The current list is sorted; we need to merge in the new list and
			// re-sort (duplicates are okay). Sorting isn't so expensive because
			// the lists are very small.

			// if (local_lengths)
			// {
			// 	local_lengths = mergeArrays(local_lengths, mobile_type.possibleLengthsLocal())
			// }
			// else
			// {
			// 	local_lengths = mobile_type.possibleLengthsLocal()
			// }
		}
	}
	// If the type doesn't exist then return 'INVALID_LENGTH'.
	else if (type && !type_info)
	{
		return 'INVALID_LENGTH'
	}

	const actual_length = nationalNumber.length

	// In `libphonenumber-js` all "local-only" formats are dropped for simplicity.
	// // This is safe because there is never an overlap beween the possible lengths
	// // and the local-only lengths; this is checked at build time.
	// if (local_lengths && local_lengths.indexOf(nationalNumber.length) >= 0)
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