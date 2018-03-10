import
{
	format,
	parse,
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
		parse('')
		format('', 'US', 'National')
		getNumberType('', 'RU')
		isValidNumber('', 'US')
		findPhoneNumbers('', 'US')
		searchPhoneNumbers('', 'US')
		new PhoneNumberSearch('')
		new AsYouType('US').input('+')

		DIGIT_PLACEHOLDER.length
		Object.keys(DIGITS).length.should.be.above(0)

		// `getPhoneCode` name is deprecated.
		getPhoneCode('KZ').should.equal('7')
		let thrower = () => getPhoneCode('ZZ')
		thrower.should.throw('Unknown')

		getCountryCallingCode('KZ').should.equal('7')
		thrower = () => getCountryCallingCode('ZZ')
		thrower.should.throw('Unknown')

		new Metadata({ countries: {} })
		parseRFC3966.should.be.a('function')
		formatRFC3966.should.be.a('function')
	})

	it(`should export ES6 custom functions`, function()
	{
		parseCustom('', metadata)
		formatCustom('', 'US', 'National', metadata)
		getNumberTypeCustom('', 'RU', metadata)
		isValidNumberCustom('', 'US', metadata)
		findPhoneNumbers('', 'US', metadata)
		searchPhoneNumbers('', 'US', metadata)
		new PhoneNumberSearchCustom('', metadata)
		getPhoneCodeCustom('KZ', metadata).should.equal('7')
	})

	it(`should export CommonJS`, function()
	{
		const Library = require('../index.common')

		Library.parse('')
		Library.format('', 'US', 'National')
		Library.getNumberType('', 'RU')
		Library.isValidNumber('', 'US')
		Library.findPhoneNumbers('', 'US')
		Library.searchPhoneNumbers('', 'US')
		new Library.PhoneNumberSearch('')
		new Library.AsYouType('US').input('+')

		Library.DIGIT_PLACEHOLDER.length
		Object.keys(Library.DIGITS).length.should.be.above(0)

		// `getPhoneCode` name is deprecated.
		Library.getPhoneCode('KZ').should.equal('7')
		let thrower = () => Library.getPhoneCode('ZZ')
		thrower.should.throw('Unknown')

		Library.getCountryCallingCode('KZ').should.equal('7')
		thrower = () => Library.getCountryCallingCode('ZZ')
		thrower.should.throw('Unknown')

	})

	it(`should export CommonJS custom functions`, function()
	{
		const Library = require('../custom')

		Library.parse('', metadata)
		Library.format('', 'US', 'National', metadata)
		Library.getNumberType('', 'RU', metadata)
		Library.isValidNumber('', 'US', metadata)
		Library.findPhoneNumbers('', 'US', metadata)
		Library.searchPhoneNumbers('', 'US', metadata)
		new Library.PhoneNumberSearch('', undefined, metadata)
		Library.getPhoneCode('KZ', metadata).should.equal('7')

		new Library.Metadata({ countries: {} })
		Library.parseRFC3966.should.be.a('function')
		Library.formatRFC3966.should.be.a('function')
	})
})