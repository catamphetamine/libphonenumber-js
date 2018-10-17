import metadata from '../metadata'
import { matches_entirely, extractCountryCallingCode } from './common'

describe('common', () =>
{
	it('`matches_entirely` should work in edge cases', function()
	{
		// No text.
		matches_entirely(undefined, '').should.equal(true)

		// "OR" in regexp.
		matches_entirely('911231231', '4\d{8}|[1-9]\d{7}').should.equal(false)
	})

	it('should extract country calling code from a number', () =>
	{
		extractCountryCallingCode('+78005553535', null, metadata).should.deep.equal({
			countryCallingCode: '7',
			number: '8005553535'
		})

		extractCountryCallingCode('+7800', null, metadata).should.deep.equal({
			countryCallingCode: '7',
			number: '800'
		})

		extractCountryCallingCode('', null, metadata).should.deep.equal({})
	})
})