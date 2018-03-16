'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.parseRFC3966 = parseRFC3966;
exports.formatRFC3966 = formatRFC3966;

var _parse = require('./parse');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://www.ietf.org/rfc/rfc3966.txt

/**
 * @param  {string} text - Phone URI (RFC 3966).
 * @return {object} `{ ?number, ?ext }`.
 */
function parseRFC3966(text) {
	var number = void 0;
	var ext = void 0;

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)(text.split(';')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var part = _step.value;

			var _part$split = part.split(':'),
			    _part$split2 = (0, _slicedToArray3.default)(_part$split, 2),
			    name = _part$split2[0],
			    value = _part$split2[1];

			switch (name) {
				case 'tel':
					number = value;
					break;
				case 'ext':
					ext = value;
					break;
				case 'phone-context':
					// Only "country contexts" are supported.
					// "Domain contexts" are ignored.
					if (value[0] === '+') {
						number = value + number;
					}
					break;
			}
		}

		// If the phone number is not viable, then abort.
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

	if (!(0, _parse.is_viable_phone_number)(number)) {
		return {};
	}

	return {
		number: number,
		ext: ext
	};
}

/**
 * @param  {object} - `{ ?number, ?extension }`.
 * @return {string} Phone URI (RFC 3966).
 */
function formatRFC3966(_ref) {
	var number = _ref.number,
	    ext = _ref.ext;

	if (!number) {
		return '';
	}

	if (number[0] !== '+') {
		throw new Error('"formatRFC3966()" expects "number" to be in E.164 format.');
	}

	return 'tel:' + number + (ext ? ';ext=' + ext : '');
}
//# sourceMappingURL=RFC3966.js.map