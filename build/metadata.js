'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _semverCompare = require('semver-compare');

var _semverCompare2 = _interopRequireDefault(_semverCompare);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Added "possibleLengths" and renamed
// "country_phone_code_to_countries" to "country_calling_codes".
var V2 = '1.0.18';

var Metadata = function () {
	function Metadata(metadata) {
		(0, _classCallCheck3.default)(this, Metadata);

		// Metadata is required.
		if (!metadata || !metadata.countries) {
			throw new Error('Metadata is required');
		}

		this.metadata = metadata;

		this.v1 = !metadata.version;
		this.v2 = metadata.version; // && compare(version, V3) === -1
	}

	(0, _createClass3.default)(Metadata, [{
		key: 'hasCountry',
		value: function hasCountry(country) {
			return this.metadata.countries[country] !== undefined;
		}
	}, {
		key: 'country',
		value: function country(_country) {
			if (!_country) {
				this._country = undefined;
				this.country_metadata = undefined;
				return this;
			}

			if (!this.hasCountry(_country)) {
				throw new Error('Unknown country: ' + _country);
			}

			this._country = _country;
			this.country_metadata = this.metadata.countries[_country];
			return this;
		}
	}, {
		key: 'countryCallingCode',
		value: function countryCallingCode() {
			return this.country_metadata[0];
		}
	}, {
		key: 'nationalNumberPattern',
		value: function nationalNumberPattern() {
			return this.country_metadata[1];
		}
	}, {
		key: 'possibleLengths',
		value: function possibleLengths() {
			if (this.v1) return;
			return this.country_metadata[2];
		}
	}, {
		key: 'formats',
		value: function formats() {
			var _this = this;

			var formats = this.country_metadata[this.v1 ? 2 : 3] || [];
			return formats.map(function (_) {
				return new Format(_, _this);
			});
		}
	}, {
		key: 'nationalPrefix',
		value: function nationalPrefix() {
			return this.country_metadata[this.v1 ? 3 : 4];
		}
	}, {
		key: 'nationalPrefixFormattingRule',
		value: function nationalPrefixFormattingRule() {
			return this.country_metadata[this.v1 ? 4 : 5];
		}
	}, {
		key: 'nationalPrefixForParsing',
		value: function nationalPrefixForParsing() {
			// If `national_prefix_for_parsing` is not set explicitly,
			// then infer it from `national_prefix` (if any)
			return this.country_metadata[this.v1 ? 5 : 6] || this.nationalPrefix();
		}
	}, {
		key: 'nationalPrefixTransformRule',
		value: function nationalPrefixTransformRule() {
			return this.country_metadata[this.v1 ? 6 : 7];
		}
	}, {
		key: 'nationalPrefixIsOptionalWhenFormatting',
		value: function nationalPrefixIsOptionalWhenFormatting() {
			return this.country_metadata[this.v1 ? 7 : 8];
		}
	}, {
		key: 'leadingDigits',
		value: function leadingDigits() {
			return this.country_metadata[this.v1 ? 8 : 9];
		}
	}, {
		key: 'types',
		value: function types() {
			return this.country_metadata[this.v1 ? 9 : 10];
		}
	}, {
		key: 'hasTypes',
		value: function hasTypes() {
			return this.types() !== undefined;
		}
	}, {
		key: 'type',
		value: function type(_type) {
			if (this.hasTypes() && getType(this.types(), _type)) {
				return new Type(getType(this.types(), _type), this);
			}
		}
	}, {
		key: 'countryCallingCodes',
		value: function countryCallingCodes() {
			if (this.v1) return this.metadata.country_phone_code_to_countries;
			return this.metadata.country_calling_codes;
		}

		// Formatting information for regions which share
		// a country calling code is contained by only one region
		// for performance reasons. For example, for NANPA region
		// ("North American Numbering Plan Administration",
		//  which includes USA, Canada, Cayman Islands, Bahamas, etc)
		// it will be contained in the metadata for `US`.
		//
		// `country_calling_code` is always valid.
		// But the actual country may not necessarily be part of the metadata.
		//

	}, {
		key: 'chooseCountryByCountryCallingCode',
		value: function chooseCountryByCountryCallingCode(country_calling_code) {
			var country = this.countryCallingCodes()[country_calling_code][0];

			// Do not want to test this case.
			// (custom metadata, not all countries).
			/* istanbul ignore else */
			if (this.hasCountry(country)) {
				this.country(country);
			}
		}
	}, {
		key: 'selectedCountry',
		value: function selectedCountry() {
			return this._country;
		}
	}]);
	return Metadata;
}();

exports.default = Metadata;

var Format = function () {
	function Format(format, metadata) {
		(0, _classCallCheck3.default)(this, Format);

		this._format = format;
		this.metadata = metadata;
	}

	(0, _createClass3.default)(Format, [{
		key: 'pattern',
		value: function pattern() {
			return this._format[0];
		}
	}, {
		key: 'format',
		value: function format() {
			return this._format[1];
		}
	}, {
		key: 'leadingDigitsPatterns',
		value: function leadingDigitsPatterns() {
			return this._format[2] || [];
		}
	}, {
		key: 'nationalPrefixFormattingRule',
		value: function nationalPrefixFormattingRule() {
			return this._format[3] || this.metadata.nationalPrefixFormattingRule();
		}
	}, {
		key: 'nationalPrefixIsOptionalWhenFormatting',
		value: function nationalPrefixIsOptionalWhenFormatting() {
			return this._format[4] || this.metadata.nationalPrefixIsOptionalWhenFormatting();
		}
	}, {
		key: 'nationalPrefixIsMandatoryWhenFormatting',
		value: function nationalPrefixIsMandatoryWhenFormatting() {
			// National prefix is omitted if there's no national prefix formatting rule
			// set for this country, or when the national prefix formatting rule
			// contains no national prefix itself, or when this rule is set but
			// national prefix is optional for this phone number format
			// (and it is not enforced explicitly)
			return this.nationalPrefixFormattingRule() &&
			// Check that national prefix formatting rule is not a dummy one.
			// Check that national prefix formatting rule actually has national prefix digit(s).
			this.usesNationalPrefix() &&
			// Or maybe national prefix is optional for this format
			!this.nationalPrefixIsOptionalWhenFormatting();
		}

		// Checks whether national prefix formatting rule contains national prefix

	}, {
		key: 'usesNationalPrefix',
		value: function usesNationalPrefix() {
			// Check that national prefix formatting rule is not a dummy one
			return this.nationalPrefixFormattingRule() !== '$1' &&
			// Check that national prefix formatting rule actually has national prefix digit(s)
			/\d/.test(this.nationalPrefixFormattingRule().replace('$1', ''));
		}
	}, {
		key: 'internationalFormat',
		value: function internationalFormat() {
			return this._format[5] || this.format();
		}
	}]);
	return Format;
}();

var Type = function () {
	function Type(type, metadata) {
		(0, _classCallCheck3.default)(this, Type);

		this.type = type;
		this.metadata = metadata;
	}

	(0, _createClass3.default)(Type, [{
		key: 'pattern',
		value: function pattern() {
			if (this.metadata.v1) return this.type;
			return this.type[0];
		}
	}, {
		key: 'possibleLengths',
		value: function possibleLengths() {
			if (this.metadata.v1) return;
			return this.type[1] || this.metadata.possibleLengths();
		}
	}]);
	return Type;
}();

function getType(types, type) {
	switch (type) {
		case 'FIXED_LINE':
			return types[0];
		case 'MOBILE':
			return types[1];
		case 'TOLL_FREE':
			return types[2];
		case 'PREMIUM_RATE':
			return types[3];
		case 'PERSONAL_NUMBER':
			return types[4];
		case 'VOICEMAIL':
			return types[5];
		case 'UAN':
			return types[6];
		case 'PAGER':
			return types[7];
		case 'VOIP':
			return types[8];
		case 'SHARED_COST':
			return types[9];
	}
}
//# sourceMappingURL=metadata.js.map