import
{
	// Deprecated: `format()` was renamed to `formatNumber()`.
	format,
	formatNumber,
	// Deprecated: `parse()` was renamed to `parseNumber()`.
	parse,
	parseNumber,
	getNumberType,
	isValidNumber,
	findPhoneNumbers,
	searchPhoneNumbers,
	PhoneNumberSearch,
	AsYouType,
	getCountryCallingCode,
	// `getPhoneCode` name is deprecated.
	getPhoneCode,

	formatCustom,
	parseCustom,
	getNumberTypeCustom,
	isValidNumberCustom,
	searchPhoneNumbersCustom,
	findPhoneNumbersCustom,
	PhoneNumberSearchCustom,
	getCountryCallingCodeCustom,
	// `getPhoneCodeCustom` name is deprecated.
	getPhoneCodeCustom,

	Metadata,
	getExtPrefix,
	parseRFC3966,
	formatRFC3966,

	DIGIT_PLACEHOLDER,
	DIGITS
}
from '../index.es6'

import metadata from '../metadata.min.json'

describe(`exports`, function()
{
	it(`should export ES6`, function()
	{
		// Deprecated: `parse()` was renamed to `parseNumber()`.
		parse('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		parseNumber('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		// Deprecated: `format()` was renamed to `formatNumber()`.
		format('2133734253', 'US', 'E.164').should.equal('+12133734253')
		formatNumber('2133734253', 'US', 'E.164').should.equal('+12133734253')
		getNumberType('2133734253', 'US').should.equal('FIXED_LINE_OR_MOBILE')
		isValidNumber('+12133734253', 'US').should.equal(true)
		findPhoneNumbers('+12133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		searchPhoneNumbers('+12133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		new PhoneNumberSearch('+12133734253', undefined).find.should.be.a('function')
		new AsYouType('US').input('+12133734253').should.equal('+1 213 373 4253')

		DIGIT_PLACEHOLDER.should.equal('x')
		Object.keys(DIGITS).length.should.be.above(0)

		// `getPhoneCode` name is deprecated.
		getPhoneCode('KZ').should.equal('7')
		getCountryCallingCode('KZ').should.equal('7')

		new Metadata({ countries: {}, country_calling_codes: {} })
		getExtPrefix('US', metadata).should.equal(' ext. ')
		parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')
	})

	// Deprecated exports: remove in `2.0.0`.
	it(`should export ES6 custom functions`, function()
	{
		parseCustom('+12133734253', metadata).should.deep.equal({ country: 'US', phone: '2133734253' })
		formatCustom('2133734253', 'US', 'E.164', metadata).should.equal('+12133734253')
		getNumberTypeCustom('2133734253', 'US', metadata).should.equal('FIXED_LINE_OR_MOBILE')
		isValidNumberCustom('', 'US', metadata)
		findPhoneNumbers('', 'US', metadata)
		searchPhoneNumbers('', 'US', metadata)
		new PhoneNumberSearchCustom('', metadata)
		// `getPhoneCode` name is deprecated.
		getPhoneCodeCustom('KZ', metadata)
		getCountryCallingCodeCustom('KZ', metadata)
	})

	it(`should export CommonJS`, function()
	{
		const Library = require('../index.common')

		// Deprecated: `parse()` was renamed to `parseNumber()`.
		Library.parse('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		Library.parseNumber('+12133734253').should.deep.equal({ country: 'US', phone: '2133734253' })
		// Deprecated: `format()` was renamed to `formatNumber()`.
		Library.format('2133734253', 'US', 'E.164').should.equal('+12133734253')
		Library.formatNumber('2133734253', 'US', 'E.164').should.equal('+12133734253')
		Library.getNumberType('2133734253', 'US').should.equal('FIXED_LINE_OR_MOBILE')
		Library.isValidNumber('+12133734253', 'US').should.equal(true)
		Library.findPhoneNumbers('+12133734253', 'US').should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		Library.searchPhoneNumbers('+12133734253', 'US')[Symbol.iterator]().next.should.be.a('function')
		new Library.PhoneNumberSearch('+12133734253', undefined).find.should.be.a('function')
		new Library.AsYouType('US').input('+12133734253').should.equal('+1 213 373 4253')

		Library.DIGIT_PLACEHOLDER.should.equal('x')
		Object.keys(Library.DIGITS).length.should.be.above(0)

		// `getPhoneCode` name is deprecated.
		Library.getPhoneCode('KZ').should.equal('7')
		Library.getCountryCallingCode('KZ').should.equal('7')

		Library.getExtPrefix('US').should.equal(' ext. ')

		Library.parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		Library.formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')
	})

	it(`should export CommonJS custom functions`, function()
	{
		const Library = require('../custom')

		// Deprecated: `parse()` was renamed to `parseNumber()`.
		Library.parse('+12133734253', metadata).should.deep.equal({ country: 'US', phone: '2133734253' })
		Library.parseNumber('+12133734253', metadata).should.deep.equal({ country: 'US', phone: '2133734253' })
		// Deprecated: `format()` was renamed to `formatNumber()`.
		Library.format('2133734253', 'US', 'E.164', metadata).should.equal('+12133734253')
		Library.formatNumber('2133734253', 'US', 'E.164', metadata).should.equal('+12133734253')
		Library.getNumberType('2133734253', 'US', metadata).should.equal('FIXED_LINE_OR_MOBILE')
		Library.isValidNumber('+12133734253', 'US', metadata).should.equal(true)
		Library.findPhoneNumbers('+12133734253', 'US', metadata).should.deep.equal([{ country: 'US', phone: '2133734253', startsAt: 0, endsAt: 12 }])
		Library.searchPhoneNumbers('+12133734253', 'US', metadata)[Symbol.iterator]().next.should.be.a('function')
		new Library.PhoneNumberSearch('+12133734253', undefined, metadata).find.should.be.a('function')
		// `getPhoneCode` name is deprecated.
		Library.getPhoneCode('KZ', metadata).should.equal('7')
		Library.getCountryCallingCode('KZ', metadata).should.equal('7')
		new Library.AsYouType('US', metadata).input('+12133734253').should.equal('+1 213 373 4253')
		new Library.Metadata({ countries: {}, country_calling_codes: {} })
		Library.getExtPrefix('US', metadata).should.equal(' ext. ')
		Library.parseRFC3966('tel:+12133734253').should.deep.equal({ number: '+12133734253' })
		Library.formatRFC3966({ number: '+12133734253' }).should.equal('tel:+12133734253')

		Library.formatIncompletePhoneNumber('+121337342', null, metadata).should.deep.equal('+1 213 373 42')
		Library.parseIncompletePhoneNumber('+1 213 373 42').should.equal('+121337342')
	})
})