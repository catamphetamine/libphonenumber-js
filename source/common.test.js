import { matches_entirely, parse_phone_number_and_country_phone_code } from '../source/common'

describe('common', () =>
{
	it('`matches_entirely` should work in edge cases', function()
	{
		// No text
		matches_entirely(undefined, /^$/).should.equal(true)
	})

	it('should parse phone number and country phone code', function()
	{
		parse_phone_number_and_country_phone_code().should.deep.equal({})
	})
})