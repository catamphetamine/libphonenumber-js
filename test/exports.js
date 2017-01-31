import
{
	format,
	parse,
	is_valid_number,
	isValidNumber,
	as_you_type,
	asYouType,
	DIGIT_PLACEHOLDER
}
from '../index.es6'

describe(`exports`, function()
{
	it(`should export ES6`, function()
	{
		parse('')
		format('', 'US', 'National')
		is_valid_number('', 'US')
		isValidNumber('', 'US')
		new as_you_type('US').input('+')
		new asYouType('US').input('+')
		DIGIT_PLACEHOLDER.length
	})

	it(`should export CommonJS`, function()
	{
		const Library = require('../index.common')

		Library.parse('')
		Library.format('', 'US', 'National')
		Library.is_valid_number('', 'US')
		Library.isValidNumber('', 'US')
		new Library.as_you_type('US').input('+')
		new Library.asYouType('US').input('+')
		Library.DIGIT_PLACEHOLDER.length
	})
})