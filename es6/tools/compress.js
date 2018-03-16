import _Object$keys from "babel-runtime/core-js/object/keys";
import _getIterator from "babel-runtime/core-js/get-iterator";
export default function compress(input) {
	var countries = {};

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = _getIterator(_Object$keys(input.countries)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var country_code = _step.value;

			var country = input.countries[country_code];

			// When changing this array also change getters in `./metadata.js`
			var country_array = [country.phone_code, country.national_number_pattern, country.possible_lengths,
			// country.possible_lengths_local,

			country.formats.map(function (format) {
				// When changing this array also change getters in `./metadata.js`
				var format_array = [format.pattern, format.format, format.leading_digits_patterns, format.national_prefix_formatting_rule, format.national_prefix_is_optional_when_formatting, format.international_format];

				return trim_array(format_array);
			}), country.national_prefix, country.national_prefix_formatting_rule, country.national_prefix_for_parsing, country.national_prefix_transform_rule, country.national_prefix_is_optional_when_formatting, country.leading_digits];

			if (country.types) {
				var types_array = [
				// These are common
				country.types.fixed_line, country.types.mobile, country.types.toll_free, country.types.premium_rate, country.types.personal_number,

				// These are less common
				country.types.voice_mail, country.types.uan, country.types.pager, country.types.voip, country.types.shared_cost].map(function (type) {
					return type && trim_array([type.pattern, type.possible_lengths
					// type.possible_lengths_local
					]);
				});

				country_array.push(trim_array(types_array));
			}

			countries[country_code] = trim_array(country_array);
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

	return {
		version: input.version,
		country_calling_codes: input.country_calling_codes,
		countries: countries
	};
}

// Empty strings are not considered "empty".
function is_empty(value) {
	return value === undefined || value === null || value === false || Array.isArray(value) && value.length === 0;
}

// Removes trailing empty values from an `array`
function trim_array(array) {
	while (array.length > 0 && is_empty(array[array.length - 1])) {
		array.pop();
	}

	return array;
}
//# sourceMappingURL=compress.js.map