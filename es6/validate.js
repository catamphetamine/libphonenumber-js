import parse, { is_viable_phone_number } from './parse';
import get_number_type, { sort_out_arguments } from './types';

// Checks if a given phone number is valid
//
// Example use cases:
//
// ```js
// is_valid('8005553535', 'RU')
// is_valid('8005553535', 'RU', metadata)
// is_valid({ phone: '8005553535', country: 'RU' })
// is_valid({ phone: '8005553535', country: 'RU' }, metadata)
// is_valid('+78005553535')
// is_valid('+78005553535', metadata)
// ```
//
export default function is_valid(arg_1, arg_2, arg_3) {
	var _sort_out_arguments = sort_out_arguments(arg_1, arg_2, arg_3),
	    input = _sort_out_arguments.input,
	    metadata = _sort_out_arguments.metadata;

	if (!input) {
		return false;
	}

	if (!input.country) {
		return false;
	}

	if (!metadata.hasCountry(input.country)) {
		throw new Error('Unknown country: ' + input.country);
	}

	metadata.country(input.country);

	if (metadata.hasTypes()) {
		return get_number_type(input, metadata.metadata) !== undefined;
	}

	return true;
}
//# sourceMappingURL=validate.js.map