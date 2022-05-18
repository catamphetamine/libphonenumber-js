import metadata from '../metadata.min.json'
import parser from '../../../../source/parse.js'

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
		parse('+7 (800) 55-35-35').should.deep.equal({})
		// Too long.
		parse('+7 (800) 55-35-35-55').should.deep.equal({})

		parse('+7 (800) 55-35-35', 'US').should.deep.equal({})
		parse('(800) 55 35 35', { defaultCountry: 'RU' }).should.deep.equal({})
		parse('+1 187 215 5230', 'US').should.deep.equal({})

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
		parse('8 (800) 555 35 35', 'RU').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// International format
		parse('+7 (800) 555-35-35').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// // Restrict to US, but not a US country phone code supplied
		// parse('+7 (800) 555-35-35', 'US').should.deep.equal({})
		// Restrict to RU
		parse('(800) 555 35 35', 'RU').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// Default to RU
		parse('8 (800) 555 35 35', { defaultCountry: 'RU' }).should.deep.equal({ country: 'RU', phone: '8005553535' })

		// Gangster partyline
		parse('+1-213-373-4253').should.deep.equal({ country: 'US', phone: '2133734253' })

		// Switzerland (just in case)
		parse('044 668 18 00', 'CH').should.deep.equal({ country: 'CH', phone: '446681800' })

		// China, Beijing
		parse('010-852644821', 'CN').should.deep.equal({ country: 'CN', phone: '10852644821' })

		// France
		parse('+33169454850').should.deep.equal({ country: 'FR', phone: '169454850' })

		// UK (Jersey)
		parse('+44 7700 300000').should.deep.equal({ country: 'JE', phone: '7700300000' })

		// KZ
		parse('+7 702 211 1111').should.deep.equal({ country: 'KZ', phone: '7022111111' })

		// Brazil
		parse('11987654321', 'BR').should.deep.equal({ country: 'BR', phone: '11987654321' })

		// Long country phone code.
		parse('+212659777777').should.deep.equal({ country: 'MA', phone: '659777777' })

		// No country could be derived.
		// parse('+212569887076').should.deep.equal({ countryPhoneCode: '212', phone: '569887076' })
	})

	it('should parse possible numbers', function()
	{
		// Invalid phone number for a given country.
		parse('1112223344', 'RU', { extended: true }).should.deep.equal
		({
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
		parse('+71112223344').should.deep.equal({})
		parse('+71112223344', { extended: true }).should.deep.equal
		({
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
		parse('+33011222333', { extended: true }).should.deep.equal
		({
			country            : 'FR',
			countryCallingCode : '33',
			phone              : '011222333',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : true
		})

		// Too short.
		parse('+7 (800) 55-35-35', { extended: true }).should.deep.equal
		({
			country            : undefined,
			countryCallingCode : '7',
			phone              : '800553535',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : false
		})

		// Too long.
		parse('+7 (800) 55-35-35-555', { extended: true }).should.deep.equal
		({
			country            : undefined,
			countryCallingCode : '7',
			phone              : '00553535555',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : false
		})

		// No national number to be parsed.
		parse('+996', { extended: true }).should.deep.equal
		({
			// countryCallingCode : '996'
		})

		// Valid number.
		parse('+78005553535', { extended: true }).should.deep.equal
		({
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
		parse('+١٢١٢٢٣٢٣٢٣٢').should.deep.equal({ country: 'US', phone: '2122323232' })
	})

	it('should work in edge cases', function()
	{
		let thrower

		// No input
		parse('').should.deep.equal({})

		// No country phone code
		parse('+').should.deep.equal({})

		// No country at all (non international number and no explicit country code)
		parse('123').should.deep.equal({})

		// No country metadata for this `require` country code
		thrower = () => parse('123', 'ZZ')
		thrower.should.throw('Unknown country')

		// No country metadata for this `default` country code
		thrower = () => parse('123', { defaultCountry: 'ZZ' })
		thrower.should.throw('Unknown country')

		// Invalid country phone code
		parse('+210').should.deep.equal({})

		// Country phone code beginning with a '0'
		parse('+0123').should.deep.equal({})

		// Barbados NANPA phone number
		parse('+12460000000').should.deep.equal({ country: 'BB', phone: '2460000000' })

		// // A case when country (restricted to) is not equal
		// // to the one parsed out of an international number.
		// parse('+1-213-373-4253', 'RU').should.deep.equal({})

		// National (significant) number too short
		parse('2', 'US').should.deep.equal({})

		// National (significant) number too long
		parse('222222222222222222', 'US').should.deep.equal({})

		// No `national_prefix_for_parsing`
		parse('41111', 'AC').should.deep.equal({ country: 'AC', phone: '41111'})

		// National prefix transform rule (Mexico).
		// Local cell phone from a land line: 044 -> 1.
		parse('0445511111111', 'MX').should.deep.equal({ country: 'MX', phone: '15511111111' })

		// No metadata
		thrower = () => parser('')
		thrower.should.throw('`metadata` argument not passed')

		// Numerical `value`
		thrower = () => parse(2141111111, 'US')
		thrower.should.throw('A text for parsing must be a string.')
	})

	it('should parse phone number extensions', function()
	{
		// "ext"
		parse('2134567890 ext 123', 'US').should.deep.equal
		({
			country : 'US',
			phone   : '2134567890',
			ext     : '123'
		})

		// "ext."
		parse('+12134567890 ext. 12345', 'US').should.deep.equal
		({
			country : 'US',
			phone   : '2134567890',
			ext     : '12345'
		})

		// "#"
		parse('+12134567890#1234').should.deep.equal
		({
			country : 'US',
			phone   : '2134567890',
			ext     : '1234'
		})

		// "x"
		parse('+78005553535 x1234').should.deep.equal
		({
			country : 'RU',
			phone   : '8005553535',
			ext     : '1234'
		})

		// Not a valid extension
		parse('2134567890 ext. abc', 'US').should.deep.equal({
			country : 'US',
			phone   : '2134567890'
		})
	})

	it('should parse invalid international numbers even if they are invalid', () =>
	{
		parse('+49(0)15123020522', 'DE').should.deep.equal
		({
			country : 'DE',
			phone   : '15123020522'
		})
	})

	it('should parse carrier codes', () =>
	{
		parse('0 15 21 5555-5555', 'BR', { extended: true }).should.deep.equal
		({
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
		parse('+870773111632', { extended: true }).should.deep.equal
		({
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
