import metadata from '../metadata.min.json' with { type: 'json' }
import parser from '../../../../source/legacy/parse.js'

function parse(...parameters)
{
	parameters.push(metadata)
	return parser.apply(this, parameters)
}

describe('parse', () =>
{
	it('should not parse invalid phone numbers', function()
	{
		// Too short.
		expect(parse('+7 (800) 55-35-35')).to.deep.equal({})
		// Too long.
		expect(parse('+7 (800) 55-35-35-55')).to.deep.equal({})

		expect(parse('+7 (800) 55-35-35', 'US')).to.deep.equal({})
		expect(parse('(800) 55 35 35', { defaultCountry: 'RU' })).to.deep.equal({})
		expect(parse('+1 187 215 5230', 'US')).to.deep.equal({})

		// Parsing national prefixes and carrier codes
		// is only required for local phone numbers
		// but some people don't understand that
		// and sometimes write international phone numbers
		// with national prefixes (or maybe even carrier codes).
		// http://ucken.blogspot.ru/2016/03/trunk-prefixes-in-skype4b.html
		// Google's original library forgives such mistakes
		// and so does this library, because it has been requested:
		// https://github.com/catamphetamine/libphonenumber-js/issues/127
		// parse('+1 1877 215 5230', 'US').should.deep.equal({})
	})

	it('should parse valid phone numbers', function()
	{
		// Instant loans
		// https://www.youtube.com/watch?v=6e1pMrYH5jI
		//
		// Restrict to RU
		expect(parse('8 (800) 555 35 35', 'RU')).to.deep.equal({ country: 'RU', phone: '8005553535' })
		// International format
		expect(parse('+7 (800) 555-35-35')).to.deep.equal({ country: 'RU', phone: '8005553535' })
		// // Restrict to US, but not a US country phone code supplied
		// parse('+7 (800) 555-35-35', 'US').should.deep.equal({})
		// Restrict to RU
		expect(parse('(800) 555 35 35', 'RU')).to.deep.equal({ country: 'RU', phone: '8005553535' })
		// Default to RU
		expect(parse('8 (800) 555 35 35', { defaultCountry: 'RU' })).to.deep.equal({ country: 'RU', phone: '8005553535' })

		// Gangster partyline
		expect(parse('+1-213-373-4253')).to.deep.equal({ country: 'US', phone: '2133734253' })

		// Switzerland (just in case)
		expect(parse('044 668 18 00', 'CH')).to.deep.equal({ country: 'CH', phone: '446681800' })

		// China, Beijing
		expect(parse('010-852644821', 'CN')).to.deep.equal({ country: 'CN', phone: '10852644821' })

		// France
		expect(parse('+33169454850')).to.deep.equal({ country: 'FR', phone: '169454850' })

		// UK (Jersey)
		expect(parse('+44 7700 300000')).to.deep.equal({ country: 'JE', phone: '7700300000' })

		// KZ
		expect(parse('+7 702 211 1111')).to.deep.equal({ country: 'KZ', phone: '7022111111' })

		// Brazil
		expect(parse('11987654321', 'BR')).to.deep.equal({ country: 'BR', phone: '11987654321' })

		// Long country phone code.
		expect(parse('+212659777777')).to.deep.equal({ country: 'MA', phone: '659777777' })

		// No country could be derived.
		// parse('+212569887076').should.deep.equal({ countryPhoneCode: '212', phone: '569887076' })
	})

	it('should parse possible numbers', function()
	{
		// Invalid phone number for a given country.
		expect(parse('1112223344', 'RU', { extended: true })).to.deep.equal({
			country            : 'RU',
			countryCallingCode : '7',
			phone              : '1112223344',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : true
		})

		// International phone number.
		// Several countries with the same country phone code.
		expect(parse('+71112223344')).to.deep.equal({})
		expect(parse('+71112223344', { extended: true })).to.deep.equal({
			country            : undefined,
			countryCallingCode : '7',
			phone              : '1112223344',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : true
		})

		// International phone number.
		// Single country with the given country phone code.
		expect(parse('+33011222333', { extended: true })).to.deep.equal({
			country            : 'FR',
			countryCallingCode : '33',
			phone              : '011222333',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : true
		})

		// Too short.
		expect(parse('+7 (800) 55-35-35', { extended: true })).to.deep.equal({
			country            : undefined,
			countryCallingCode : '7',
			phone              : '800553535',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : false
		})

		// Too long.
		expect(parse('+7 (800) 55-35-35-555', { extended: true })).to.deep.equal({
			country            : undefined,
			countryCallingCode : '7',
			phone              : '00553535555',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : false
		})

		// No national number to be parsed.
		expect(parse('+996', { extended: true })).to.deep.equal({
			// countryCallingCode : '996'
		})

		// Valid number.
		expect(parse('+78005553535', { extended: true })).to.deep.equal({
			country            : 'RU',
			countryCallingCode : '7',
			phone              : '8005553535',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : true,
			possible           : true
		})
	})

	it('should parse non-European digits', function()
	{
		expect(parse('+١٢١٢٢٣٢٣٢٣٢')).to.deep.equal({ country: 'US', phone: '2122323232' })
	})

	it('should work in edge cases', function()
	{
		let thrower

		// No input
		expect(parse('')).to.deep.equal({})

		// No country phone code
		expect(parse('+')).to.deep.equal({})

		// No country at all (non international number and no explicit country code)
		expect(parse('123')).to.deep.equal({})

		// No country metadata for this `require` country code
		thrower = () => parse('123', 'ZZ')
		expect(thrower).to.throw('Unknown country')

		// No country metadata for this `default` country code
		thrower = () => parse('123', { defaultCountry: 'ZZ' })
		expect(thrower).to.throw('Unknown country')

		// Invalid country phone code
		expect(parse('+210')).to.deep.equal({})

		// Country phone code beginning with a '0'
		expect(parse('+0123')).to.deep.equal({})

		// Barbados NANPA phone number
		expect(parse('+12460000000')).to.deep.equal({ country: 'BB', phone: '2460000000' })

		// // A case when country (restricted to) is not equal
		// // to the one parsed out of an international number.
		// parse('+1-213-373-4253', 'RU').should.deep.equal({})

		// National (significant) number too short
		expect(parse('2', 'US')).to.deep.equal({})

		// National (significant) number too long
		expect(parse('222222222222222222', 'US')).to.deep.equal({})

		// No `national_prefix_for_parsing`
		expect(parse('41111', 'AC')).to.deep.equal({ country: 'AC', phone: '41111'})

		// National prefix transform rule (Mexico).
		// Local cell phone from a land line: 044 -> 1.
		expect(parse('0445511111111', 'MX')).to.deep.equal({ country: 'MX', phone: '15511111111' })

		// No metadata
		thrower = () => parser('')
		expect(thrower).to.throw('`metadata` argument not passed')

		// Numerical `value`
		thrower = () => parse(2141111111, 'US')
		expect(thrower).to.throw('A text for parsing must be a string.')
	})

	it('should parse phone number extensions', function()
	{
		// "ext"
		expect(parse('2134567890 ext 123', 'US')).to.deep.equal({
			country : 'US',
			phone   : '2134567890',
			ext     : '123'
		})

		// "ext."
		expect(parse('+12134567890 ext. 12345', 'US')).to.deep.equal({
			country : 'US',
			phone   : '2134567890',
			ext     : '12345'
		})

		// "#"
		expect(parse('+12134567890#1234')).to.deep.equal({
			country : 'US',
			phone   : '2134567890',
			ext     : '1234'
		})

		// "x"
		expect(parse('+78005553535 x1234')).to.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			ext     : '1234'
		})

		// Not a valid extension
		expect(parse('2134567890 ext. abc', 'US')).to.deep.equal({
			country : 'US',
			phone   : '2134567890'
		})
	})

	it('should parse invalid international numbers even if they are invalid', () =>
	{
		expect(parse('+49(0)15123020522', 'DE')).to.deep.equal({
			country : 'DE',
			phone   : '15123020522'
		})
	})

	it('should parse carrier codes', () =>
	{
		expect(parse('0 15 21 5555-5555', 'BR', { extended: true })).to.deep.equal({
			country            : 'BR',
			countryCallingCode : '55',
			phone              : '2155555555',
			carrierCode        : '15',
			ext                : undefined,
			valid              : true,
			possible           : true
		})
	})

	it('should parse non-geographic numbers', () =>
	{
		expect(parse('+870773111632', { extended: true })).to.deep.equal({
			country            : undefined,
			countryCallingCode : '870',
			phone              : '773111632',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : true,
			possible           : true
		})
	})
})
