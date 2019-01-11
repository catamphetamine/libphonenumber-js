import metadata from '../metadata.min.json'
import AsYouType_, { close_dangling_braces, strip_dangling_braces, repeat } from './AsYouType'

class AsYouType extends AsYouType_ {
	constructor(country_code) {
		super(country_code, metadata)
	}
}

describe('as you type', () => {
	it('should parse and format phone numbers as you type', () => {
		// International number test
		new AsYouType().input('+12133734').should.equal('+1 213 373 4')
		// Local number test
		new AsYouType('US').input('2133734').should.equal('(213) 373-4')

		// With national prefix test
		new AsYouType('RU').input('880055535').should.equal('8 (800) 555-35')

		// US national number retains national prefix.
		new AsYouType('US').input('12133734').should.equal('1 (213) 373-4')

		// US national number retains national prefix (full number).
		new AsYouType('US').input('12133734253').should.equal('1 (213) 373-4253')

		// With national prefix test
		new AsYouType('RU').input('88005553535').should.equal('8 (800) 555-35-35')

		// Should discard the national prefix
		// when a whole phone number format matches
		new AsYouType('RU').input('8800555353').should.equal('880 055-53-53')

		new AsYouType('CH').input('044-668-1').should.equal('044 668 1')

		let formatter

		// Test International phone number (international)

		formatter = new AsYouType()

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.countryCallingCode).should.equal('undefined')
		type(formatter.template).should.equal('undefined')

		formatter.input('+').should.equal('+')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.countryCallingCode).should.equal('undefined')
		type(formatter.template).should.equal('undefined')

		formatter.input('1').should.equal('+1')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		formatter.countryCallingCode.should.equal('1')
		type(formatter.getTemplate()).should.equal('undefined')

		formatter.input('2').should.equal('+1 2')
		formatter.getTemplate().should.equal('xx x')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')

		formatter.input('1').should.equal('+1 21')
		formatter.input('3').should.equal('+1 213')
		formatter.input(' ').should.equal('+1 213')
		formatter.input('3').should.equal('+1 213 3')
		formatter.input('3').should.equal('+1 213 33')
		formatter.input('3').should.equal('+1 213 333')
		formatter.input('4').should.equal('+1 213 333 4')
		formatter.input('4').should.equal('+1 213 333 44')
		formatter.input('4').should.equal('+1 213 333 444')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')

		formatter.input('4').should.equal('+1 213 333 4444')

		// formatter.valid.should.be.true
		formatter.country.should.equal('US')
		// This one below contains "punctuation spaces"
		// along with the regular spaces
		formatter.template.should.equal('xx xxx xxx xxxx')

		formatter.input('5').should.equal('+121333344445')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		formatter.countryCallingCode.should.equal('1')
		type(formatter.template).should.equal('undefined')

		// Check that clearing an international formatter
		// also clears country metadata.

		formatter.reset()

		formatter.input('+').should.equal('+')
		formatter.input('7').should.equal('+7')
		formatter.input('9').should.equal('+7 9')
		formatter.input('99 111 22 33').should.equal('+7 999 111 22 33')

		// Test Switzerland phone numbers

		formatter = new AsYouType('CH')

		formatter.input(' ').should.equal('')
		formatter.input('0').should.equal('0')
		formatter.input('4').should.equal('04')
		formatter.input(' ').should.equal('04')
		formatter.input('-').should.equal('04')
		formatter.input('4').should.equal('044')
		formatter.input('-').should.equal('044')
		formatter.input('6').should.equal('044 6')
		formatter.input('6').should.equal('044 66')
		formatter.input('8').should.equal('044 668')
		formatter.input('-').should.equal('044 668')
		formatter.input('1').should.equal('044 668 1')
		formatter.input('8').should.equal('044 668 18')

		// formatter.valid.should.be.false
		formatter.country.should.equal('CH')
		formatter.template.should.equal('xxx xxx xx xx')

		formatter.input(' 00').should.equal('044 668 18 00')

		// formatter.valid.should.be.true
		formatter.country.should.equal('CH')
		formatter.template.should.equal('xxx xxx xx xx')

		formatter.input('9').should.equal('04466818009')

		// formatter.valid.should.be.false
		formatter.country.should.equal('CH')
		type(formatter.template).should.equal('undefined')

		// Kazakhstan (non-main country for +7 country phone code)

		formatter = new AsYouType()

		formatter.input('+77172580659')
		formatter.country.should.equal('KZ')

		// Brazil

		formatter = new AsYouType('BR')
		formatter.input('11987654321').should.equal('(11) 98765-4321')

		// UK (Jersey) (non-main country for +44 country phone code)

		formatter = new AsYouType()
		formatter.input('+447700300000').should.equal('+44 7700 300000')
		formatter.template.should.equal('xxx xxxx xxxxxx')
		formatter.country.should.equal('JE')

		// Test Afghanistan phone numbers

		formatter = new AsYouType('AF')

		// No national prefix
		formatter.input('44444444').should.equal('44444444')
		type(formatter.template).should.equal('undefined')

		// With national prefix
		formatter.reset().input('044444444').should.equal('044 444 444')
		formatter.template.should.equal('xxx xxx xxxx')

		// Hungary (braces must be part of the template)
		formatter = new AsYouType('HU')
		formatter.input('301234567').should.equal('(30) 123 4567')
		formatter.template.should.equal('(xx) xxx xxxx')

		// Test Russian phone numbers
		// (with optional national prefix `8`)

		formatter = new AsYouType('RU')

		formatter.input('8').should.equal('8')
		formatter.input('9').should.equal('8 9')
		formatter.input('9').should.equal('8 99')
		formatter.input('9').should.equal('8 (999)')
		formatter.input('-').should.equal('8 (999)')
		formatter.input('1234').should.equal('8 (999) 123-4')
		formatter.input('567').should.equal('8 (999) 123-45-67')
		formatter.input('8').should.equal('899912345678')

		// Shouldn't strip national prefix if it is optional
		// and if it's a valid phone number.
		formatter = new AsYouType('RU')
		// formatter.input('8005553535').should.equal('(800) 555-35-35')
		formatter.input('8005553535')
		formatter.getNationalNumber().should.equal('8005553535')

		// Check that clearing an national formatter:
		//  * doesn't clear country metadata
		//  * clears all other things

		formatter.reset()

		formatter.input('8').should.equal('8')
		formatter.input('9').should.equal('8 9')
		formatter.input('9').should.equal('8 99')
		formatter.input('9').should.equal('8 (999)')
		formatter.input('-').should.equal('8 (999)')
		formatter.input('1234').should.equal('8 (999) 123-4')
		formatter.input('567').should.equal('8 (999) 123-45-67')
		formatter.input('8').should.equal('899912345678')

		// National prefix should not be prepended
		// when formatting local NANPA phone numbers.
		new AsYouType('US').input('1').should.equal('1')
		new AsYouType('US').input('12').should.equal('1 2')
		new AsYouType('US').input('123').should.equal('1 23')

		// Bulgaria
		// (should not prepend national prefix `0`)
		new AsYouType('BG').input('111 222 3').should.equal('1112223')

		// Brazil
		// (should not add braces around `12`
		//  because the phone number is being output in the international format)
		new AsYouType().input('+55123456789').should.equal('+55 12 3456 789')
		new AsYouType('BR').input('+55123456789').should.equal('+55 12 3456 789')
		new AsYouType('BR').input('123456789').should.equal('(12) 3456-789')

		// Deutchland
		new AsYouType().input('+4915539898001').should.equal('+49 15539 898001')

		// KZ detection
		formatter = new AsYouType()
		formatter.input('+7 702 211 1111')
		formatter.country.should.equal('KZ')
		// formatter.valid.should.equal(true)

		// New Zealand formatting fix (issue #89)
		new AsYouType('NZ').input('0212').should.equal('021 2')

		// South Korea
		formatter = new AsYouType()
		formatter.input('+82111111111').should.equal('+82 11 111 1111')
		formatter.template.should.equal('xxx xx xxx xxxx')
	})

	it('should not forgive incorrect international phone numbers', () => {
		let formatter

		formatter = new AsYouType()
		formatter.input('+1 1 877 215 5230').should.equal('+118772155230')
		formatter.getNationalNumber().should.equal('18772155230')

		formatter = new AsYouType()
		formatter.input('+788005553535').should.equal('+788005553535')
		formatter.getNationalNumber().should.equal('88005553535')
	})

	it('should return a partial template for current value', () => {
		const asYouType = new AsYouType('US')

		asYouType.input('').should.equal('')
		expect(asYouType.getTemplate()).to.be.undefined

		asYouType.input('2').should.equal('2')
		// asYouType.getTemplate().should.equal('x')
		// Doesn't format for a single digit.
		asYouType.getTemplate().should.equal('x')

		asYouType.input('1').should.equal('21')
		asYouType.getTemplate().should.equal('xx')

		asYouType.input('3').should.equal('(213)')
		asYouType.getTemplate().should.equal('(xxx)')
	})

	it('should close dangling braces', () => {
		close_dangling_braces('(000) 123-45 (9  )', 15).should.equal('(000) 123-45 (9  )')
	})

	it('should strip dangling braces', () => {
		strip_dangling_braces('(000) 123-45 (9').should.equal('(000) 123-45 9')
		strip_dangling_braces('(000) 123-45 (9)').should.equal('(000) 123-45 (9)')
	})

	it(`should fall back to the default country`, () => {
		const formatter = new AsYouType('RU')

		formatter.input('8').should.equal('8')
		formatter.input('9').should.equal('8 9')
		formatter.input('9').should.equal('8 99')
		formatter.input('9').should.equal('8 (999)')

		// formatter.valid.should.be.false
		formatter.template.should.equal('x (xxx) xxx-xx-xx')
		formatter.country.should.equal('RU')
		formatter.countryCallingCode.should.equal('7')

		formatter.input('000000000000').should.equal('8999000000000000')

		// formatter.valid.should.be.false
		type(formatter.template).should.equal('undefined')
		formatter.country.should.equal('RU')
		formatter.countryCallingCode.should.equal('7')

		formatter.reset()

		// formatter.valid.should.be.false
		type(formatter.template).should.equal('undefined')
		formatter.country.should.equal('RU')
		formatter.countryCallingCode.should.equal('7')

		formatter.input('+1-213-373-4253').should.equal('+1 213 373 4253')

		// formatter.valid.should.be.true
		formatter.template.should.equal('xx xxx xxx xxxx')
		formatter.country.should.equal('US')
		formatter.countryCallingCode.should.equal('1')
	})

	it('should work in edge cases', () => {
		let formatter
		let thrower

		// No metadata
		thrower = () => new AsYouType_('RU')
		thrower.should.throw('`metadata` argument not passed')

		// Second '+' sign

		formatter = new AsYouType('RU')

		formatter.input('+').should.equal('+')
		formatter.input('7').should.equal('+7')
		formatter.input('+').should.equal('+7')

		// Out-of-position '+' sign

		formatter = new AsYouType('RU')

		formatter.input('8').should.equal('8')
		formatter.input('+').should.equal('8')

		// No format matched

		formatter = new AsYouType('RU')

		formatter.input('88005553535').should.equal('8 (800) 555-35-35')
		formatter.input('0').should.equal('880055535350')

		// Invalid country phone code

		formatter = new AsYouType()

		formatter.input('+0123').should.equal('+0123')

		// No country specified and not an international number

		formatter = new AsYouType()

		formatter.input('88005553535').should.equal('88005553535')

		// Extract national prefix when no `national_prefix` is set

		formatter = new AsYouType('AD')

		formatter.input('155555').should.equal('155 555')

		// Typing nonsense

		formatter = new AsYouType('RU')

		formatter.input('+1abc2').should.equal('')

		// Should reset default country when explicitly
		// typing in an international phone number

		formatter = new AsYouType('RU')

		formatter.input('+')
		type(formatter.country).should.equal('undefined')
		type(formatter.countryCallingCode).should.equal('undefined')

		// Country not inferrable from the phone number,
		// while the phone number itself can already be formatted "completely".

		formatter = new AsYouType()

		formatter.input('+12223333333')
		type(formatter.country).should.equal('undefined')
		formatter.countryCallingCode.should.equal('1')

		// An otherwise matching phone number format is skipped
		// when it requires a national prefix but no national prefix was entered.
		formatter = new AsYouType('CN')
		formatter.input('01010000').should.equal('010 10000')
		formatter.reset().input('1010000').should.equal('10 1000 0')

		// Reset a chosen format when it no longer applies given the new leading digits.
		// If Google changes metadata for England then this test might not cover the case.
		formatter = new AsYouType('GB')
		formatter.input('0845').should.equal('0845')
		// New leading digits don't match the format previously chosen.
		// Reset the format.
		formatter.input('0').should.equal('0845 0')
	})

	it('should not accept phone number extensions', () => {
		new AsYouType().input('+1-213-373-4253 ext. 123').should.equal('')
	})

	it('should parse non-European digits', () => {
		new AsYouType().input('+١٢١٢٢٣٢٣٢٣٢').should.equal('+1 212 232 3232')
	})

	it('should return a PhoneNumber instance', () => {
		const formatter = new AsYouType('BR')

		// No country calling code.
		expect(formatter.getNumber()).to.be.undefined

		formatter.input('+1')
		// No national number digits.
		expect(formatter.getNumber()).to.be.undefined

		formatter.input('213-373-4253')

		let phoneNumber = formatter.getNumber()
		phoneNumber.country.should.equal('US')
		phoneNumber.countryCallingCode.should.equal('1')
		phoneNumber.number.should.equal('+12133734253')
		phoneNumber.nationalNumber.should.equal('2133734253')

		formatter.reset()
		formatter.input('+1-113-373-4253')

		phoneNumber = formatter.getNumber()
		expect(phoneNumber.country).to.be.undefined
		phoneNumber.countryCallingCode.should.equal('1')

		// An incorrect NANPA international phone number.
		// (contains national prefix in an international phone number)

		formatter.reset()
		formatter.input('+1-1')

		phoneNumber = formatter.getNumber()
		expect(phoneNumber.country).to.be.undefined
		phoneNumber.countryCallingCode.should.equal('1')
		phoneNumber.number.should.equal('+11')
	})

	it('shouldn\'t throw when passed a non-existent default country', () => {
		new AsYouType('XX').input('+78005553535').should.equal('+7 800 555 35 35')
		new AsYouType('XX').input('88005553535').should.equal('88005553535')
	})

	it('should parse carrier codes', () => {
		const formatter = new AsYouType('BR')

		formatter.input('0 15 21 5555-5555')
		let phoneNumber = formatter.getNumber()
		phoneNumber.carrierCode.should.equal('15')

		formatter.reset()
		formatter.input('+1-213-373-4253')
		phoneNumber = formatter.getNumber()
		expect(phoneNumber.carrierCode).to.be.undefined
	})

	it('should repeat string N times', () => {
		repeat('a', 0).should.equal('')
		repeat('a', 3).should.equal('aaa')
		repeat('a', 4).should.equal('aaaa')
	})
})

function type(something) {
	return typeof something
}