import _Array$from from 'babel-runtime/core-js/array/from';
import _Set from 'babel-runtime/core-js/set';
import _typeof from 'babel-runtime/helpers/typeof';
import _getIterator from 'babel-runtime/core-js/get-iterator';
import parse, { is_viable_phone_number } from './parse';

import { matches_entirely } from './common';

import Metadata from './metadata';

var non_fixed_line_types = ['MOBILE', 'PREMIUM_RATE', 'TOLL_FREE', 'SHARED_COST', 'VOIP', 'PERSONAL_NUMBER', 'PAGER', 'UAN', 'VOICEMAIL'];

// Finds out national phone number type (fixed line, mobile, etc)
export default function get_number_type(arg_1, arg_2, arg_3) {
	var _sort_out_arguments = sort_out_arguments(arg_1, arg_2, arg_3),
	    input = _sort_out_arguments.input,
	    metadata = _sort_out_arguments.metadata;

	// When no input was passed


	if (!input) {
		return;
	}

	// When `parse()` returned `{}`
	// meaning that the phone number is not a valid one.
	if (!input.country) {
		return;
	}

	if (!metadata.hasCountry(input.country)) {
		throw new Error('Unknown country: ' + input.country);
	}

	var national_number = input.phone;
	metadata.country(input.country);

	// The following is copy-pasted from the original function:
	// https://github.com/googlei18n/libphonenumber/blob/3ea547d4fbaa2d0b67588904dfa5d3f2557c27ff/javascript/i18n/phonenumbers/phonenumberutil.js#L2835

	// Is this national number even valid for this country
	if (!matches_entirely(national_number, metadata.nationalNumberPattern())) {
		return;
	}

	// Is it fixed line number
	if (is_of_type(national_number, 'FIXED_LINE', metadata)) {
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if "mobile" pattern is ""
		// then it means it was removed due to being a duplicate of the fixed-line pattern.
		//
		if (metadata.type('MOBILE') && metadata.type('MOBILE').pattern() === '') {
			return 'FIXED_LINE_OR_MOBILE';
		}

		// v1 metadata.
		// Legacy.
		// Deprecated.
		if (!metadata.type('MOBILE')) {
			return 'FIXED_LINE_OR_MOBILE';
		}

		// Check if the number happens to qualify as both fixed line and mobile.
		// (no such country in the minimal metadata set)
		/* istanbul ignore if */
		if (is_of_type(national_number, 'MOBILE', metadata)) {
			return 'FIXED_LINE_OR_MOBILE';
		}

		return 'FIXED_LINE';
	}

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = _getIterator(non_fixed_line_types), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _type = _step.value;

			if (is_of_type(national_number, _type, metadata)) {
				return _type;
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
}

export function is_of_type(national_number, type, metadata) {
	type = metadata.type(type);

	if (!type || !type.pattern()) {
		return false;
	}

	// Check if any possible number lengths are present;
	// if so, we use them to avoid checking
	// the validation pattern if they don't match.
	// If they are absent, this means they match
	// the general description, which we have
	// already checked before a specific number type.
	if (type.possibleLengths() && type.possibleLengths().indexOf(national_number.length) < 0) {
		return false;
	}

	return matches_entirely(national_number, type.pattern());
}

// Sort out arguments
export function sort_out_arguments(arg_1, arg_2, arg_3) {
	var input = void 0;
	var metadata = void 0;

	// If the phone number is passed as a string.
	// `getNumberType('88005553535', ...)`.
	if (typeof arg_1 === 'string') {
		// If "resrict country" argument is being passed
		// then convert it to an `options` object.
		// `getNumberType('88005553535', 'RU', metadata)`.
		if (typeof arg_2 === 'string' || arg_2 === undefined) {
			metadata = arg_3;

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(arg_1)) {
				input = parse(arg_1, arg_2, metadata);
			}
		}
		// No "resrict country" argument is being passed.
		// International phone number is passed.
		// `getNumberType('+78005553535', metadata)`.
		else {
				metadata = arg_2;

				// `parse` extracts phone numbers from raw text,
				// therefore it will cut off all "garbage" characters,
				// while this `validate` function needs to verify
				// that the phone number contains no "garbage"
				// therefore the explicit `is_viable_phone_number` check.
				if (is_viable_phone_number(arg_1)) {
					input = parse(arg_1, metadata);
				}
			}
	}
	// If the phone number is passed as a parsed phone number.
	// `getNumberType({ phone: '88005553535', country: 'RU' }, ...)`.
	else if (is_object(arg_1) && typeof arg_1.phone === 'string') {
			// The `arg_1` must be a valid phone number
			// as a whole, not just a part of it which gets parsed here.
			if (is_viable_phone_number(arg_1.phone)) {
				input = arg_1;
			}

			metadata = arg_2;
		} else throw new TypeError('A phone number must either be a string or an object of shape { phone, [country] }.');

	// Metadata is required.
	if (!metadata || !metadata.countries) {
		throw new Error('Metadata is required');
	}

	return { input: input, metadata: new Metadata(metadata) };
}

// Should only be called for the "new" metadata which has "possible lengths".
export function check_number_length_for_type(national_number, type, metadata) {
	var type_info = metadata.type(type);

	// There should always be "<possiblePengths/>" set for every type element.
	// This is declared in the XML schema.
	// For size efficiency, where a sub-description (e.g. fixed-line)
	// has the same "<possiblePengths/>" as the "general description", this is missing,
	// so we fall back to the "general description". Where no numbers of the type
	// exist at all, there is one possible length (-1) which is guaranteed
	// not to match the length of any real phone number.
	var possible_lengths = type_info && type_info.possibleLengths() || metadata.possibleLengths();
	// let local_lengths    = type_info && type.possibleLengthsLocal() || metadata.possibleLengthsLocal()

	if (type === 'FIXED_LINE_OR_MOBILE') {
		// No such country in metadata.
		/* istanbul ignore next */
		if (!metadata.type('FIXED_LINE')) {
			// The rare case has been encountered where no fixedLine data is available
			// (true for some non-geographical entities), so we just check mobile.
			return test_number_length_for_type(national_number, 'MOBILE', metadata);
		}

		var mobile_type = metadata.type('MOBILE');

		if (mobile_type) {
			// Merge the mobile data in if there was any. "Concat" creates a new
			// array, it doesn't edit possible_lengths in place, so we don't need a copy.
			// Note that when adding the possible lengths from mobile, we have
			// to again check they aren't empty since if they are this indicates
			// they are the same as the general desc and should be obtained from there.
			possible_lengths = merge_arrays(possible_lengths, mobile_type.possibleLengths());
			// The current list is sorted; we need to merge in the new list and
			// re-sort (duplicates are okay). Sorting isn't so expensive because
			// the lists are very small.

			// if (local_lengths)
			// {
			// 	local_lengths = merge_arrays(local_lengths, mobile_type.possibleLengthsLocal())
			// }
			// else
			// {
			// 	local_lengths = mobile_type.possibleLengthsLocal()
			// }
		}
	}
	// If the type doesn't exist then return 'INVALID_LENGTH'.
	else if (type && !type_info) {
			return 'INVALID_LENGTH';
		}

	var actual_length = national_number.length;

	// // This is safe because there is never an overlap beween the possible lengths
	// // and the local-only lengths; this is checked at build time.
	// if (local_lengths && local_lengths.indexOf(national_number.length) >= 0)
	// {
	// 	return 'IS_POSSIBLE_LOCAL_ONLY'
	// }

	var minimum_length = possible_lengths[0];

	if (minimum_length === actual_length) {
		return 'IS_POSSIBLE';
	}

	if (minimum_length > actual_length) {
		return 'TOO_SHORT';
	}

	if (possible_lengths[possible_lengths.length - 1] < actual_length) {
		return 'TOO_LONG';
	}

	// We skip the first element since we've already checked it.
	return possible_lengths.indexOf(actual_length, 1) >= 0 ? 'IS_POSSIBLE' : 'INVALID_LENGTH';
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
var is_object = function is_object(_) {
	return (typeof _ === 'undefined' ? 'undefined' : _typeof(_)) === 'object';
};

function merge_arrays(a, b) {
	var merged = new _Set(a);

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = _getIterator(b), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var i = _step2.value;

			merged.add(i);
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	merged = _Array$from(merged);
	merged.sort(function (a, b) {
		return a - b;
	});
	return merged;
}
//# sourceMappingURL=types.js.map