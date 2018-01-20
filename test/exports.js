import
{
	format,
	parse,
	// `get_number_type` name is deprecated
	get_number_type,
	getNumberType,
	// `is_valid_number` name is deprecated
	is_valid_number,
	isValidNumber,
	// `as_you_type` name is deprecated
	as_you_type,
	AsYouType,
	// `asYouType` name is deprecated
	asYouType,
	getPhoneCode,

	formatCustom,
	parseCustom,
	getNumberTypeCustom,
	isValidNumberCustom,
	getPhoneCodeCustom,

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
		// `get_number_type` name is deprecated
		get_number_type('', 'RU')
		getNumberType('', 'RU')
		// `is_valid_number` name is deprecated
		is_valid_number('', 'US')
		isValidNumber('', 'US')
		new AsYouType('US').input('+')
		// `as_you_type` name is deprecated
		new as_you_type('US').input('+')
		// `asYouType` name is deprecated
		new asYouType('US').input('+')

		DIGIT_PLACEHOLDER.length
		Object.keys(DIGITS).length.should.be.above(0)

		getPhoneCode('KZ').should.equal('7')
		const thrower = () => getPhoneCode('ZZ')
		thrower.should.throw('Unknown')
	})

	it(`should export ES6 custom functions`, function()
	{
		parseCustom('', metadata)
		formatCustom('', 'US', 'National', metadata)
		getNumberTypeCustom('', 'RU', metadata)
		isValidNumberCustom('', 'US', metadata)
		getPhoneCodeCustom('KZ', metadata).should.equal('7')
	})

	it(`should export CommonJS`, function()
	{
		const Library = require('../index.common')

		Library.parse('')
		Library.format('', 'US', 'National')
		// `get_number_type` name is deprecated
		Library.get_number_type('', 'RU')
		Library.getNumberType('', 'RU')
		// `is_valid_number` name is deprecated
		Library.is_valid_number('', 'US')
		Library.isValidNumber('', 'US')
		new Library.AsYouType('US').input('+')
		// `as_you_type` name is deprecated
		new Library.as_you_type('US').input('+')
		// `asYouType` name is deprecated
		new Library.asYouType('US').input('+')

		Library.DIGIT_PLACEHOLDER.length
		Object.keys(Library.DIGITS).length.should.be.above(0)

		Library.getPhoneCode('KZ').should.equal('7')
		const thrower = () => Library.getPhoneCode('ZZ')
		thrower.should.throw('Unknown')
	})

	it(`should export CommonJS custom functions`, function()
	{
		const Library = require('../custom')

		Library.parse('', metadata)
		Library.format('', 'US', 'National', metadata)
		Library.getNumberType('', 'RU', metadata)
		Library.isValidNumber('', 'US', metadata)
		Library.getPhoneCode('KZ', metadata).should.equal('7')
	})
})