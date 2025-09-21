import Metadata from '../metadata.js'
import mergeArrays from './mergeArrays.js'

export default function checkNumberLength(nationalNumber, country, metadata) {
	return checkNumberLengthForType(nationalNumber, country, undefined, metadata)
}

// Checks whether a number is possible for a certain `country` based on the number length.
//
// This function is not supported by metadata generated with ancient versions of
// `libphonenumber-js` (before version `1.0.18`) which didn't include "possible lengths".
//
// There was also a known issue with `checkNumberLength()` function:
// if a number is possible only in a certain `country` among several `countries`
// that share the same "country calling code", that function would check
// the possibility of the phone number only in the "main" `country` for the "country calling code"
// and would not check if it's actually be possible in the speciifc `country`.
//
// For example, "+1310xxxx" numbers are valid in Canada.
// However, they are not possible in the US due to being too short.
// Since Canada and the US share the same country calling code — "+1" —
// `checkNumberLength()` function used to return not "IS_POSSIBLE" for "+1310xxxx" numbers.
//
// In such cases, when using "/max" metadata, `isValid()` could output `true`
// but at the same time `isPossible()` could output `false`, which was contradictory.
//
// See https://issuetracker.google.com/issues/335892662 for the discusson in Google's issues.
//
// The solution suggested by Google was implemented: an optional `country` argument
// was added to `checkNumberLength()` function. If present, that `country` will be used
// to check phone number length for that specific `country` rather than the "main" country
// for the shared "country calling code".
//
export function checkNumberLengthForType(nationalNumber, country, type, metadata) {
	// If the exact `country` is specified, it's no necessarily already selected in `metadata`.
	// Most likely, in cases when there're multiple countries corresponding to the same
	// "country calling code", the "main" country for that "country calling code" will be selected.
	if (country) {
		metadata = new Metadata(metadata.metadata)
		metadata.selectNumberingPlan(country)
	}

	const type_info = metadata.type(type)

	// There should always be "<possiblePengths/>" set for every type element.
	// This is declared in the XML schema.
	// For size efficiency, where a sub-description (e.g. fixed-line)
	// has the same "<possiblePengths/>" as the "general description", this is missing,
	// so we fall back to the "general description". Where no numbers of the type
	// exist at all, there is one possible length (-1) which is guaranteed
	// not to match the length of any real phone number.
	let possible_lengths = type_info && type_info.possibleLengths() || metadata.possibleLengths()
	// let local_lengths = type_info && type.possibleLengthsLocal() || metadata.possibleLengthsLocal()

	// Metadata before version `1.0.18` didn't contain `possible_lengths`.
	if (!possible_lengths) {
		return 'IS_POSSIBLE'
	}

	if (type === 'FIXED_LINE_OR_MOBILE') {
		// No such country in metadata.
		/* istanbul ignore next */
		if (!metadata.type('FIXED_LINE')) {
			// The rare case has been encountered where no fixedLine data is available
			// (true for some non-geographic entities), so we just check mobile.
			return checkNumberLengthForType(nationalNumber, country, 'MOBILE', metadata)
		}

		const mobile_type = metadata.type('MOBILE')
		if (mobile_type) {
			// Merge the mobile data in if there was any. "Concat" creates a new
			// array, it doesn't edit possible_lengths in place, so we don't need a copy.
			// Note that when adding the possible lengths from mobile, we have
			// to again check they aren't empty since if they are this indicates
			// they are the same as the general desc and should be obtained from there.
			possible_lengths = mergeArrays(possible_lengths, mobile_type.possibleLengths())
			// The current list is sorted; we need to merge in the new list and
			// re-sort (duplicates are okay). Sorting isn't so expensive because
			// the lists are very small.

			// if (local_lengths) {
			// 	local_lengths = mergeArrays(local_lengths, mobile_type.possibleLengthsLocal())
			// } else {
			// 	local_lengths = mobile_type.possibleLengthsLocal()
			// }
		}
	}
	// If the type doesn't exist then return 'INVALID_LENGTH'.
	else if (type && !type_info) {
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

	if (minimum_length === actual_length) {
		return 'IS_POSSIBLE'
	}

	if (minimum_length > actual_length) {
		return 'TOO_SHORT'
	}

	if (possible_lengths[possible_lengths.length - 1] < actual_length) {
		return 'TOO_LONG'
	}

	// We skip the first element since we've already checked it.
	return possible_lengths.indexOf(actual_length, 1) >= 0 ? 'IS_POSSIBLE' : 'INVALID_LENGTH'
}