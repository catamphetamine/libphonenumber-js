import metadata from '../metadata.min'
import formatter, { local_to_international_style } from './format'

function format(...parameters)
{
	parameters.push(metadata)
	return formatter.apply(this, parameters)
}

describe('format', () =>
{
	it('should work with the first argument being a E.164 number', function()
	{
		format('+11111111111', 'National').should.equal('(111) 111-1111')
		format('+12133734253', 'National').should.equal('(213) 373-4253')
		format('+12133734253', 'International').should.equal('+1 213 373 4253')

		// Formatting invalid E.164 numbers.
		format('+1111', 'International').should.equal('+1 111')
		format('+1111', 'National').should.equal('111')
	})

	it('should work with the first object argument expanded', function()
	{
		format('2133734253', 'US', 'National').should.equal('(213) 373-4253')
		format('2133734253', 'US', 'International').should.equal('+1 213 373 4253')
	})

	it('should sort out the arguments', function()
	{
		const options =
		{
			formatExtension: (number, extension) => `${number} доб. ${extension}`
		}

		format
		({
			phone   : '8005553535',
			country : 'RU',
			ext     : '123'
		},
		'National', options).should.equal('800 555-35-35 доб. 123')

		format('+78005553535', 'National', options).should.equal('800 555-35-35')
		format('8005553535', 'RU', 'National', options).should.equal('800 555-35-35')
	})

	it('should format valid phone numbers', function()
	{
		// Switzerland
		format({ country: 'CH', phone: '446681800' }, 'International').should.equal('+41 44 668 18 00')
		format({ country: 'CH', phone: '446681800' }, 'E.164').should.equal('+41446681800')
		format({ country: 'CH', phone: '446681800' }, 'RFC3966').should.equal('tel:+41446681800')
		format({ country: 'CH', phone: '446681800' }, 'National').should.equal('044 668 18 00')

		// France
		format({ country: 'FR', phone: '169454850' }, 'National').should.equal('01 69 45 48 50')

		// KZ
		format('+7 702 211 1111', 'National').should.deep.equal('702 211 1111')
	})

	it('should work in edge cases', function()
	{
		let thrower

		// Explicitly specified country and derived country conflict
		format('+12133734253', 'RU', 'National').should.equal('+12133734253')

		// No phone number
		format('', 'RU', 'International').should.equal('+7')
		format('', 'RU', 'National').should.equal('')

		// No suitable format
		format('+121337342530', 'US', 'National').should.equal('21337342530')
		// No suitable format (leading digits mismatch)
		format('18199999', 'AD', 'National').should.equal('18199999')

		// Numerical `value`
		thrower = () => format(89150000000, 'RU', 'National')
		thrower.should.throw('A phone number must either be a string or an object of shape { phone, [country] }.')

		// No metadata for country
		format('+121337342530', 'USA', 'National').should.equal('21337342530')
		format('21337342530', 'USA', 'National').should.equal('21337342530')

		// No format type
		thrower = () => format('+123')
		thrower.should.throw('Format type argument not passed')

		// Unknown format type
		thrower = () => format('123', 'US', 'Gay')
		thrower.should.throw('Unknown format type')

		// No metadata
		thrower = () => formatter('123', 'US', 'E.164')
		thrower.should.throw('`metadata` argument not passed')

		// No formats
		format('012345', 'AC', 'National').should.equal('012345')

		// No `fromCountry` for `IDD` format.
		expect(format('+78005553535', 'IDD')).to.be.undefined

		// `fromCountry` has no default IDD prefix.
		expect(format('+78005553535', 'IDD', { fromCountry: 'BO' })).to.be.undefined
	})

	it('should convert local to international style format', function()
	{
		local_to_international_style('(xxx) xxx-xx-xx').should.equal('xxx xxx xx xx')
		local_to_international_style('(xxx)xxx').should.equal('xxx xxx')
	})

	it('should format phone number extensions', function()
	{
		// National
		format
		({
			country: 'US',
			phone: '2133734253',
			ext: '123'
		},
		'National').should.equal('(213) 373-4253 ext. 123')

		// International
		format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'International').should.equal('+1 213 373 4253 ext. 123')

		// International
		format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'International').should.equal('+1 213 373 4253 ext. 123')

		// E.164
		format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'E.164').should.equal('+12133734253')

		// RFC3966
		format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'RFC3966').should.equal('tel:+12133734253;ext=123')

		// Custom ext prefix.
		format
		({
			country : 'GB',
			phone   : '7912345678',
			ext     : '123'
		},
		'International').should.equal('+44 7912 345678 x123')
	})

	it('should format possible numbers', function()
	{
		format({ countryCallingCode: '7', phone: '1111111111' }, 'E.164')
			.should.equal('+71111111111')
	})

	it('should format IDD-prefixed number', function()
	{
		// No `fromCountry`.
		expect(format('+78005553535', 'IDD')).to.be.undefined

		// No default IDD prefix.
		expect(format('+78005553535', 'IDD', { fromCountry: 'BO' })).to.be.undefined

		// Same country calling code.
		format('+12133734253', 'IDD', { fromCountry: 'CA', humanReadable: true }).should.equal('1 (213) 373-4253')
		format('+78005553535', 'IDD', { fromCountry: 'KZ', humanReadable: true }).should.equal('800 555-35-35')

		format('+78005553535', 'IDD', { fromCountry: 'US' }).should.equal('01178005553535')
		format('+78005553535', 'IDD', { fromCountry: 'US', humanReadable: true }).should.equal('011 7 800 555 35 35')
	})
})