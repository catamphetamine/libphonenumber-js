import
{
	format,
	parse,
	is_valid_number,
	isValidNumber,
	as_you_type,
	asYouType
}
from '../index.es6'

describe(`exports`, function()
{
	it(`should export ES6`, function()
	{
		parse('')
		format('', 'US')
		is_valid_number('', 'US')
		isValidNumber('', 'US')
		new as_you_type('US').input('+')
		new asYouType('US').input('+')
		asYouType.DIGIT_PLACEHOLDER.length
	})

	it(`should export CommonJS`, function()
	{
		const Library = require('../index.common')

		Library.parse('')
		Library.format('', 'US')
		Library.is_valid_number('', 'US')
		Library.isValidNumber('', 'US')
		new Library.as_you_type('US').input('+')
		new Library.asYouType('US').input('+')
		Library.asYouType.DIGIT_PLACEHOLDER.length
	})
})