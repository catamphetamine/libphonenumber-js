import metadata from '../metadata.min.json'
import _parseNumber from './parse'
import { extractCountryCallingCode } from './parse_'

function parseNumber(...parameters) {
	parameters.push(metadata)
	return _parseNumber.apply(this, parameters)
}

describe('parse', () => {
	it('should not parse invalid phone numbers', () => {
		// Too short.
		parseNumber('+7 (800) 55-35-35').should.deep.equal({})
		// Too long.
		parseNumber('+7 (800) 55-35-35-55').should.deep.equal({})

		parseNumber('+7 (800) 55-35-35', 'US').should.deep.equal({})
		parseNumber('(800) 55 35 35', { defaultCountry: 'RU' }).should.deep.equal({})
		parseNumber('+1 187 215 5230', 'US').should.deep.equal({})

		parseNumber('911231231', 'BE').should.deep.equal({})
	})

	it('should parse valid phone numbers', () => {
		// Instant loans
		// https://www.youtube.com/watch?v=6e1pMrYH5jI
		//
		// Restrict to RU
		parseNumber('Phone: 8 (800) 555 35 35.', 'RU').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// International format
		parseNumber('Phone: +7 (800) 555-35-35.').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// // Restrict to US, but not a US country phone code supplied
		// parseNumber('+7 (800) 555-35-35', 'US').should.deep.equal({})
		// Restrict to RU
		parseNumber('(800) 555 35 35', 'RU').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// Default to RU
		parseNumber('8 (800) 555 35 35', { defaultCountry: 'RU' }).should.deep.equal({ country: 'RU', phone: '8005553535' })

		// Gangster partyline
		parseNumber('+1-213-373-4253').should.deep.equal({ country: 'US', phone: '2133734253' })

		// Switzerland (just in case)
		parseNumber('044 668 18 00', 'CH').should.deep.equal({ country: 'CH', phone: '446681800' })

		// China, Beijing
		parseNumber('010-852644821', 'CN').should.deep.equal({ country: 'CN', phone: '10852644821' })

		// France
		parseNumber('+33169454850').should.deep.equal({ country: 'FR', phone: '169454850' })

		// UK (Jersey)
		parseNumber('+44 7700 300000').should.deep.equal({ country: 'JE', phone: '7700300000' })

		// KZ
		parseNumber('+7 702 211 1111').should.deep.equal({ country: 'KZ', phone: '7022111111' })

		// Brazil
		parseNumber('11987654321', 'BR').should.deep.equal({ country: 'BR', phone: '11987654321' })

		// Long country phone code.
		parseNumber('+212659777777').should.deep.equal({ country: 'MA', phone: '659777777' })

		// No country could be derived.
		// parseNumber('+212569887076').should.deep.equal({ countryPhoneCode: '212', phone: '569887076' })

		// GB. Moible numbers starting 07624* are Isle of Man.
		parseNumber('07624369230', 'GB').should.deep.equal({ country: 'IM', phone: '7624369230' })
	})

	it('should parse possible numbers', () => {
		// Invalid phone number for a given country.
		parseNumber('1112223344', 'RU', { extended: true }).should.deep.equal({
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
		parseNumber('+71112223344').should.deep.equal({})
		parseNumber('+71112223344', { extended: true }).should.deep.equal({
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
		parseNumber('+33011222333', { extended: true }).should.deep.equal({
			country            : 'FR',
			countryCallingCode : '33',
			phone              : '011222333',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : true
		})

		// Too short.
		parseNumber('+7 (800) 55-35-35', { extended: true }).should.deep.equal({
			country            : 'RU',
			countryCallingCode : '7',
			phone              : '800553535',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : false
		})

		// Too long.
		parseNumber('+7 (800) 55-35-35-555', { extended: true }).should.deep.equal({
			country            : undefined,
			countryCallingCode : '7',
			phone              : '00553535555',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : false,
			possible           : false
		})

		// No national number to be parsed.
		parseNumber('+996', { extended: true }).should.deep.equal({
			// countryCallingCode : '996'
		})

		// Valid number.
		parseNumber('+78005553535', { extended: true }).should.deep.equal({
			country            : 'RU',
			countryCallingCode : '7',
			phone              : '8005553535',
			carrierCode        : undefined,
			ext                : undefined,
			valid              : true,
			possible           : true
		})

		// https://github.com/catamphetamine/libphonenumber-js/issues/211
		parseNumber('+966', { extended: true }).should.deep.equal({})
		parseNumber('+9664', { extended: true }).should.deep.equal({})
		parseNumber('+96645', { extended: true }).should.deep.equal({
			carrierCode        : undefined,
			phone              : '45',
			ext                : undefined,
			country            : 'SA',
			countryCallingCode : '966',
			possible           : false,
			valid              : false
		})
	})

	it('should parse non-European digits', () => {
		parseNumber('+١٢١٢٢٣٢٣٢٣٢').should.deep.equal({ country: 'US', phone: '2122323232' })
	})

	it('should work in edge cases', () => {
		let thrower

		// No input
		parseNumber('').should.deep.equal({})

		// No country phone code
		parseNumber('+').should.deep.equal({})

		// No country at all (non international number and no explicit country code)
		parseNumber('123').should.deep.equal({})

		// No country metadata for this `require` country code
		thrower = () => parseNumber('123', 'ZZ')
		thrower.should.throw('Unknown country')

		// No country metadata for this `default` country code
		thrower = () => parseNumber('123', { defaultCountry: 'ZZ' })
		thrower.should.throw('Unknown country')

		// Invalid country phone code
		parseNumber('+210').should.deep.equal({})

		// Invalid country phone code (extended parsing mode)
		parseNumber('+210', { extended: true }).should.deep.equal({})

		// Too short of a number.
		parseNumber('1', 'US', { extended: true }).should.deep.equal({})

		// Too long of a number.
		parseNumber('1111111111111111111', 'US', { extended: true }).should.deep.equal({})

		// Not a number.
		parseNumber('abcdefg', 'US', { extended: true }).should.deep.equal({})

		// Country phone code beginning with a '0'
		parseNumber('+0123').should.deep.equal({})

		// Barbados NANPA phone number
		parseNumber('+12460000000').should.deep.equal({ country: 'BB', phone: '2460000000' })

		// // A case when country (restricted to) is not equal
		// // to the one parsed out of an international number.
		// parseNumber('+1-213-373-4253', 'RU').should.deep.equal({})

		// National (significant) number too short
		parseNumber('2', 'US').should.deep.equal({})

		// National (significant) number too long
		parseNumber('222222222222222222', 'US').should.deep.equal({})

		// No `national_prefix_for_parsing`
		parseNumber('41111', 'AC').should.deep.equal({ country: 'AC', phone: '41111'})

		// https://github.com/catamphetamine/libphonenumber-js/issues/235
		// `matchesEntirely()` bug fix.
		parseNumber('+4915784846111‬').should.deep.equal({ country: 'DE', phone: '15784846111' })

		// National prefix transform rule (Mexico).
		// Local cell phone from a land line: 044 -> 1.
		parseNumber('0445511111111', 'MX').should.deep.equal({ country: 'MX', phone: '15511111111' })

		// No metadata
		thrower = () => _parseNumber('')
		thrower.should.throw('`metadata` argument not passed')

		// Numerical `value`
		thrower = () => parseNumber(2141111111, 'US')
		thrower.should.throw('A text for parsing must be a string.')

		// Input string too long.
		parseNumber('8005553535                                                                                                                                                                                                                                                 ', 'RU').should.deep.equal({})
	})

	it('should parse phone number extensions', () => {
		// "ext"
		parseNumber('2134567890 ext 123', 'US').should.deep.equal({
			country : 'US',
			phone   : '2134567890',
			ext     : '123'
		})

		// "ext."
		parseNumber('+12134567890 ext. 12345', 'US').should.deep.equal({
			country : 'US',
			phone   : '2134567890',
			ext     : '12345'
		})

		// "доб."
		parseNumber('+78005553535 доб. 1234', 'RU').should.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			ext     : '1234'
		})

		// "#"
		parseNumber('+12134567890#1234').should.deep.equal({
			country : 'US',
			phone   : '2134567890',
			ext     : '1234'
		})

		// "x"
		parseNumber('+78005553535 x1234').should.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			ext     : '1234'
		})

		// Not a valid extension
		parseNumber('2134567890 ext. 1234567890', 'US').should.deep.equal({})
	})

	it('should parse RFC 3966 phone numbers', () => {
		parseNumber('tel:+78005553535;ext=123').should.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			ext     : '123'
		})

		// Should parse "visual separators".
		parseNumber('tel:+7(800)555-35.35;ext=123').should.deep.equal({
			country : 'RU',
			phone   : '8005553535',
			ext     : '123'
		})

		// Invalid number.
		parseNumber('tel:+7x8005553535;ext=123').should.deep.equal({})
	})

	it('should parse invalid international numbers even if they are invalid', () => {
		parseNumber('+7(8)8005553535', 'RU').should.deep.equal({
			country : 'RU',
			phone   : '8005553535'
		})
	})

	it('should parse carrier codes', () => {
		parseNumber('0 15 21 5555-5555', 'BR', { extended: true }).should.deep.equal({
			country            : 'BR',
			countryCallingCode : '55',
			phone              : '2155555555',
			carrierCode        : '15',
			ext                : undefined,
			valid              : true,
			possible           : true
		})
	})

	it('should parse IDD prefixes', () => {
		parseNumber('011 61 2 3456 7890', 'US').should.deep.equal({
			phone   : '234567890',
			country : 'AU'
		})

		parseNumber('011 61 2 3456 7890', 'FR').should.deep.equal({})

		parseNumber('00 61 2 3456 7890', 'US').should.deep.equal({})

		parseNumber('810 61 2 3456 7890', 'RU').should.deep.equal({
			phone   : '234567890',
			country : 'AU'
		})
	})

	it('should work with v2 API', () => {
		parseNumber('+99989160151539')
	})

	it('should extract country calling code from a number', () => {
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
