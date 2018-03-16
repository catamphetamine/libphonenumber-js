'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (country, metadata) {
	metadata = new _metadata2.default(metadata);

	if (!metadata.hasCountry(country)) {
		throw new Error('Unknown country: ' + country);
	}

	return metadata.country(country).countryCallingCode();
};

var _metadata = require('./metadata');

var _metadata2 = _interopRequireDefault(_metadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=getCountryCallingCode.js.map