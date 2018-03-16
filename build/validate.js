'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = is_valid;

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function is_valid(arg_1, arg_2, arg_3) {
	var _sort_out_arguments = (0, _types.sort_out_arguments)(arg_1, arg_2, arg_3),
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
		return (0, _types2.default)(input, metadata.metadata) !== undefined;
	}

	return true;
}
//# sourceMappingURL=validate.js.map