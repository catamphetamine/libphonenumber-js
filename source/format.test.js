import metadata from '../metadata.min.json'
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
		format('+12133734253', 'NATIONAL').should.equal('(213) 373-4253')
		format('+12133734253', 'INTERNATIONAL').should.equal('+1 213 373 4253')

		// Invalid number.
		format('+12111111111', 'NATIONAL').should.equal('(211) 111-1111')

		// Formatting invalid E.164 numbers.
		format('+11111', 'INTERNATIONAL').should.equal('+1 1111')
		format('+11111', 'NATIONAL').should.equal('1111')
	})

	it('should work with the first object argument expanded', function()
	{
		format('2133734253', 'US', 'NATIONAL').should.equal('(213) 373-4253')
		format('2133734253', 'US', 'INTERNATIONAL').should.equal('+1 213 373 4253')
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
		'NATIONAL', options).should.equal('8 (800) 555-35-35 доб. 123')

		format('+78005553535', 'NATIONAL', options).should.equal('8 (800) 555-35-35')
		format('8005553535', 'RU', 'NATIONAL', options).should.equal('8 (800) 555-35-35')
	})

	it('should format valid phone numbers', function()
	{
		// Switzerland
		format({ country: 'CH', phone: '446681800' }, 'INTERNATIONAL').should.equal('+41 44 668 18 00')
		format({ country: 'CH', phone: '446681800' }, 'E.164').should.equal('+41446681800')
		format({ country: 'CH', phone: '446681800' }, 'RFC3966').should.equal('tel:+41446681800')
		format({ country: 'CH', phone: '446681800' }, 'NATIONAL').should.equal('044 668 18 00')

		// France
		format({ country: 'FR', phone: '169454850' }, 'NATIONAL').should.equal('01 69 45 48 50')

		// Kazakhstan
		format('+7 702 211 1111', 'NATIONAL').should.deep.equal('8 (702) 211 1111')
	})

	it('should format national numbers with national prefix even if it\'s optional', function()
	{
		// Russia
		format({ country: 'RU', phone: '9991234567' }, 'NATIONAL').should.equal('8 (999) 123-45-67')
	})

	it('should work in edge cases', function()
	{
		let thrower

		// No phone number
		format('', 'RU', 'INTERNATIONAL').should.equal('')
		format('', 'RU', 'NATIONAL').should.equal('')

		format({ country: 'RU', phone: '' }, 'INTERNATIONAL').should.equal('+7')
		format({ country: 'RU', phone: '' }, 'NATIONAL').should.equal('')

		// No suitable format
		format('+121337342530', 'US', 'NATIONAL').should.equal('21337342530')
		// No suitable format (leading digits mismatch)
		format('28199999', 'AD', 'NATIONAL').should.equal('28199999')

		// Numerical `value`
		thrower = () => format(89150000000, 'RU', 'NATIONAL')
		thrower.should.throw('A phone number must either be a string or an object of shape { phone, [country] }.')

		// No metadata for country
		expect(() => format('+121337342530', 'USA', 'NATIONAL')).to.throw('Unknown country')
		expect(() => format('21337342530', 'USA', 'NATIONAL')).to.throw('Unknown country')

		// No format type
		thrower = () => format('+123')
		thrower.should.throw('`format` argument not passed')

		// Unknown format type
		thrower = () => format('123', 'US', 'Gay')
		thrower.should.throw('Unknown format type')

		// No metadata
		thrower = () => formatter('123', 'US', 'E.164')
		thrower.should.throw('`metadata`')

		// No formats
		format('012345', 'AC', 'NATIONAL').should.equal('012345')

		// No `fromCountry` for `IDD` format.
		expect(format('+78005553535', 'IDD')).to.be.undefined

		// `fromCountry` has no default IDD prefix.
		expect(format('+78005553535', 'IDD', { fromCountry: 'BO' })).to.be.undefined

		// No such country.
		expect(() => format({ phone: '123', country: 'USA' }, 'NATIONAL')).to.throw('Unknown country')
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
		'NATIONAL').should.equal('(213) 373-4253 ext. 123')

		// International
		format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'INTERNATIONAL').should.equal('+1 213 373 4253 ext. 123')

		// International
		format
		({
			country : 'US',
			phone   : '2133734253',
			ext     : '123'
		},
		'INTERNATIONAL').should.equal('+1 213 373 4253 ext. 123')

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
		'INTERNATIONAL').should.equal('+44 7912 345678 x123')
	})

	it('should format possible numbers', function()
	{
		format({ countryCallingCode: '7', phone: '1111111111' }, 'E.164')
			.should.equal('+71111111111')

		format({ countryCallingCode: '7', phone: '1111111111' }, 'NATIONAL')
			.should.equal('1111111111')

		format({ countryCallingCode: '7', phone: '1111111111' }, 'INTERNATIONAL')
			.should.equal('+7 1111111111')
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