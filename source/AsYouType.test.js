import metadata from '../metadata.min.json'
import AsYouType_, { closeNonPairedParens, stripNonPairedParens, repeat } from './AsYouType'

class AsYouType extends AsYouType_ {
	constructor(country_code) {
		super(country_code, metadata)
	}
}

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

describe('as you type', () => {
	it('should use "national_prefix_formatting_rule"', () => {
		// With national prefix (full).
		new AsYouType('RU').input('88005553535').should.equal('8 (800) 555-35-35')
		// With national prefix (partial).
		new AsYouType('RU').input('880055535').should.equal('8 (800) 555-35')
	})

	it('should populate national number template (digit by digit)', () => {
		const formatter = new AsYouType('US')
		formatter.input('1')
		formatter.template.should.equal('x (xxx) xxx-xxxx')
		formatter.populatedNationalNumberTemplate.should.equal('1 (xxx) xxx-xxxx')
		formatter.input('213')
		formatter.populatedNationalNumberTemplate.should.equal('1 (213) xxx-xxxx')
		formatter.input('3734253')
		formatter.populatedNationalNumberTemplate.should.equal('1 (213) 373-4253')
	})

	it('should populate international number template (digit by digit) (default country)', () => {
		const formatter = new AsYouType('US')
		expect(formatter.template).to.be.undefined
		expect(formatter.populatedNationalNumberTemplate).to.be.undefined
		formatter.input('').should.equal('')
		expect(formatter.template).to.be.undefined
		expect(formatter.populatedNationalNumberTemplate).to.be.undefined
		formatter.input('+').should.equal('+')
		expect(formatter.template).to.be.undefined
		expect(formatter.populatedNationalNumberTemplate).to.be.undefined
		formatter.input('1').should.equal('+1')
		formatter.template.should.equal('xx xxx xxx xxxx')
		// Hasn't yet started formatting the phone number using the template.
		formatter.populatedNationalNumberTemplate.should.equal('xxx xxx xxxx')
		// Has some national number digits, starts formatting the phone number using the template.
		formatter.input('213')
		formatter.populatedNationalNumberTemplate.should.equal('213 xxx xxxx')
		formatter.input('3734253')
		formatter.populatedNationalNumberTemplate.should.equal('213 373 4253')
	})

	it('should populate international number template (digit by digit)', () => {
		const formatter = new AsYouType()
		expect(formatter.template).to.be.undefined
		expect(formatter.populatedNationalNumberTemplate).to.be.undefined
		formatter.input('').should.equal('')
		expect(formatter.template).to.be.undefined
		expect(formatter.populatedNationalNumberTemplate).to.be.undefined
		formatter.input('+').should.equal('+')
		expect(formatter.template).to.be.undefined
		expect(formatter.populatedNationalNumberTemplate).to.be.undefined
		formatter.input('1').should.equal('+1')
		formatter.template.should.equal('xx xxx xxx xxxx')
		// Hasn't yet started formatting the phone number using the template.
		formatter.populatedNationalNumberTemplate.should.equal('xxx xxx xxxx')
		// Has some national number digits, starts formatting the phone number using the template.
		formatter.input('213')
		formatter.populatedNationalNumberTemplate.should.equal('213 xxx xxxx')
		formatter.input('3734253')
		formatter.populatedNationalNumberTemplate.should.equal('213 373 4253')
	})

	it('should populate national number template (attempt to format complete number)', () => {
		const formatter = new AsYouType('US')
		formatter.input('12133734253').should.equal('1 (213) 373-4253')
		formatter.template.should.equal('x (xxx) xxx-xxxx')
		formatter.populatedNationalNumberTemplate.should.equal('1 (213) 373-4253')
	})

	it('should parse and format phone numbers as you type', () => {
		// International number test
		new AsYouType().input('+12133734').should.equal('+1 213 373 4')
		// Local number test
		new AsYouType('US').input('2133734').should.equal('(213) 373-4')

		// US national number retains national prefix.
		new AsYouType('US').input('12133734').should.equal('1 (213) 373-4')

		// US national number retains national prefix (full number).
		new AsYouType('US').input('12133734253').should.equal('1 (213) 373-4253')

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
		formatter.getTemplate().should.equal('')

		formatter.input('+').should.equal('+')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		type(formatter.countryCallingCode).should.equal('undefined')
		formatter.getTemplate().should.equal('x')

		formatter.input('1').should.equal('+1')

		// formatter.valid.should.be.false
		type(formatter.country).should.equal('undefined')
		formatter.countryCallingCode.should.equal('1')
		formatter.getTemplate().should.equal('xx')

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

		formatter.input('5').should.equal('+1 21333344445')

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
		formatter.input('11987654321').should.equal('11 98765-4321')

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

		// Braces must be part of the template.
		formatter = new AsYouType('RU')
		formatter.input('88005553535').should.equal('8 (800) 555-35-35')
		formatter.template.should.equal('x (xxx) xxx-xx-xx')

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
		new AsYouType('BR').input('123456789').should.equal('12 3456-789')

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
		// formatter.input('+1 1 877 215 5230').should.equal('+1 1 877 215 5230')
		formatter.input('+1 1 877 215 5230').should.equal('+1 18772155230')
		// formatter.getNationalNumber().should.equal('8772155230')
		formatter.getNationalNumber().should.equal('18772155230')

		formatter = new AsYouType()
		formatter.input('+78800555353').should.equal('+7 880 055 53 53')
		formatter.input('5').should.equal('+7 88005553535')
		formatter.getNationalNumber().should.equal('88005553535')
	})

	it('should return a partial template for current value', () => {
		const asYouType = new AsYouType('US')

		asYouType.input('').should.equal('')
		asYouType.getTemplate().should.equal('')

		asYouType.input('2').should.equal('2')
		// asYouType.getTemplate().should.equal('x')
		// Doesn't format for a single digit.
		asYouType.getTemplate().should.equal('x')

		asYouType.input('1').should.equal('21')
		asYouType.getTemplate().should.equal('xx')

		asYouType.input('3').should.equal('(213)')
		asYouType.getTemplate().should.equal('(xxx)')
	})

	it('should close non-paired braces', () => {
		closeNonPairedParens('(000) 123-45 (9  )', 15).should.equal('(000) 123-45 (9  )')
	})

	it('should strip non-paired braces', () => {
		stripNonPairedParens('(000) 123-45 (9').should.equal('(000) 123-45 9')
		stripNonPairedParens('(000) 123-45 (9)').should.equal('(000) 123-45 (9)')
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
		// formatter.countryCallingCode.should.equal('7')

		formatter.input('000000000000').should.equal('8999000000000000')

		// formatter.valid.should.be.false
		type(formatter.template).should.equal('undefined')
		formatter.country.should.equal('RU')
		// formatter.countryCallingCode.should.equal('7')

		formatter.reset()

		// formatter.valid.should.be.false
		type(formatter.template).should.equal('undefined')
		formatter.country.should.equal('RU')
		// formatter.countryCallingCode.should.equal('7')

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

		formatter.input('+1abc2').should.equal('+1')

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
		new AsYouType().input('+1-213-373-4253 ext. 123').should.equal('+1 213 373 4253')
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
		expect(phoneNumber).to.not.be.undefined

		formatter.input('1')
		phoneNumber = formatter.getNumber()
		expect(phoneNumber.country).to.be.undefined
		phoneNumber.countryCallingCode.should.equal('1')
		phoneNumber.number.should.equal('+111')
	})

	it('should work with Argentina numbers', () => {
		// The same mobile number is written differently
		// in different formats in Argentina:
		// `9` gets prepended in international format.
		const asYouType = new AsYouType('AR')
		asYouType.input('+5493435551212').should.equal('+54 9 3435 55 1212')
		asYouType.reset()
		// Digits shouldn't be changed.
		// Normally formats `034 35 15 55 1212` as `03934 35-55-1212`.
		asYouType.input('0343515551212').should.equal('0343515551212')
	})

	it('should work with Mexico numbers', () => {
		const asYouType = new AsYouType('MX')
		// Fixed line.
		asYouType.input('+52(449)978-000').should.equal('+52 449 978 000')
		asYouType.input('1').should.equal('+52 449 978 0001')
		asYouType.reset()
		asYouType.input('01449978000').should.equal('01449 978 000')
		asYouType.getTemplate().should.equal('xxxxx xxx xxx')
		asYouType.input('1').should.equal('01449 978 0001')
		asYouType.getTemplate().should.equal('xxxxx xxx xxxx')
		asYouType.reset()
		asYouType.input('(449)978-000').should.equal('449 978 000')
		asYouType.getTemplate().should.equal('xxx xxx xxx')
		asYouType.input('1').should.equal('449 978 0001')
		asYouType.getTemplate().should.equal('xxx xxx xxxx')
		// Mobile.
		// `1` is prepended before area code to mobile numbers in international format.
		asYouType.reset()
		asYouType.input('+521331234567').should.equal('+52 13 3123 4567')
		asYouType.getTemplate().should.equal('xxx xx xxxx xxxx')
		// https://issuetracker.google.com/issues/147938979
		// asYouType.input('8').should.equal('+52 133 1234 5678')
		// asYouType.getTemplate().should.equal('xxx xxx xxxx xxxx')
		asYouType.input('8').should.equal('+52 13312345678')
		asYouType.getTemplate().should.equal('xxx xxxxxxxxxxx')
		asYouType.reset()
		asYouType.input('+52331234567').should.equal('+52 33 1234 567')
		asYouType.input('8').should.equal('+52 33 1234 5678')
		asYouType.reset()
		asYouType.input('044331234567').should.equal('04433 1234 567')
		asYouType.input('8').should.equal('04433 1234 5678')
		asYouType.reset()
		asYouType.input('045331234567').should.equal('04533 1234 567')
		asYouType.input('8').should.equal('04533 1234 5678')
	})

	it('should not duplicate area code for certain countries', () => {
		// https://github.com/catamphetamine/libphonenumber-js/issues/318
		const asYouType = new AsYouType('VI')
		// Even though `parse("3406934")` would return a
		// "(340) 340-6934" national number, still
		// "As You Type" formatter should leave it as "(340) 6934".
		asYouType.input('340693').should.equal('(340) 693')
		asYouType.input('4').should.equal('(340) 693-4')
		asYouType.input('123').should.equal('(340) 693-4123')
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

	it('should format when default country calling code is configured', () => {
		const formatter = new AsYouType({ defaultCallingCode: '7' })
		formatter.input('88005553535').should.equal('8 (800) 555-35-35')
		formatter.getNumber().countryCallingCode.should.equal('7')
		formatter.getNumber().country.should.equal('RU')
	})

	it('shouldn\'t return PhoneNumber if country calling code hasn\'t been input yet', () => {
		const formatter = new AsYouType()
		formatter.input('+80')
		expect(formatter.getNumber()).to.be.undefined
	})

	it('should format non-geographic numbering plan phone numbers', () => {
		const formatter = new AsYouType()
		formatter.input('+').should.equal('+')
		formatter.input('8').should.equal('+8')
		formatter.input('7').should.equal('+87')
		expect(formatter.country).to.be.undefined
		formatter.input('0').should.equal('+870')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			formatter.country.should.equal('001')
		} else {
			expect(formatter.country).to.be.undefined
		}
		formatter.input('7').should.equal('+870 7')
		formatter.input('7').should.equal('+870 77')
		formatter.input('3').should.equal('+870 773')
		formatter.input('1').should.equal('+870 773 1')
		formatter.input('1').should.equal('+870 773 11')
		formatter.input('1').should.equal('+870 773 111')
		formatter.input('6').should.equal('+870 773 111 6')
		formatter.input('3').should.equal('+870 773 111 63')
		formatter.input('2').should.equal('+870 773 111 632')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			formatter.getNumber().country.should.equal('001')
		} else {
			expect(formatter.country).to.be.undefined
		}
		formatter.getNumber().countryCallingCode.should.equal('870')
	})

	it('should format non-geographic numbering plan phone numbers (default country calling code)', () => {
		const formatter = new AsYouType({ defaultCallingCode: '870' })
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			formatter.getNumber().country.should.equal('001')
		} else {
			expect(formatter.country).to.be.undefined
		}
		formatter.input('7').should.equal('7')
		formatter.input('7').should.equal('77')
		formatter.input('3').should.equal('773')
		formatter.input('1').should.equal('773 1')
		formatter.input('1').should.equal('773 11')
		formatter.input('1').should.equal('773 111')
		formatter.input('6').should.equal('773 111 6')
		formatter.input('3').should.equal('773 111 63')
		formatter.input('2').should.equal('773 111 632')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			formatter.getNumber().country.should.equal('001')
		} else {
			expect(formatter.country).to.be.undefined
		}
		formatter.getNumber().countryCallingCode.should.equal('870')
	})

	it('should not format non-geographic numbering plan phone numbers (default country 001)', () => {
		const formatter = new AsYouType('001')
		expect(formatter.defaultCountry).to.be.undefined
		expect(formatter.defaultCallingCode).to.be.undefined
		formatter.input('7').should.equal('7')
		formatter.input('7').should.equal('77')
		formatter.input('3').should.equal('773')
		formatter.input('1').should.equal('7731')
		formatter.input('1').should.equal('77311')
		formatter.input('1').should.equal('773111')
		formatter.input('6').should.equal('7731116')
		formatter.input('3').should.equal('77311163')
		formatter.input('2').should.equal('773111632')
		expect(formatter.country).to.be.undefined
		expect(formatter.getNumber()).to.be.undefined
	})

	it('should return PhoneNumber', () => {
		const formatter = new AsYouType('RU')
		formatter.input('+1111')
		formatter.getNumber().number.should.equal('+1111')
	})

	it('should return PhoneNumber with autocorrected international numbers without leading +', () => {
		// https://github.com/catamphetamine/libphonenumber-js/issues/316
		const formatter = new AsYouType('FR')
		formatter.input('33612902554').should.equal('33612902554')
		formatter.getNumber().country.should.equal('FR')
		formatter.getNumber().nationalNumber.should.equal('612902554')
		formatter.getNumber().number.should.equal('+33612902554')
		// Should also strip national prefix.
		formatter.reset()
		formatter.input('330612902554').should.equal('330612902554')
		formatter.getNumber().country.should.equal('FR')
		formatter.getNumber().nationalNumber.should.equal('612902554')
		formatter.getNumber().number.should.equal('+33612902554')
		// On second thought, this "prepend default area code" feature won't be added,
		// because when a user selects "British Virgin Islands" and inputs
		// "2291234", then they see "(229) 123-4" which clearly indicates that
		// they should input the complete phone number (with area code).
		// So, unless a user completely doesn't understand what they're doing,
		// they'd input the complete phone number (with area code).
		// // Should prepend the default area code in British Virgin Islands.
		// // https://github.com/catamphetamine/react-phone-number-input/issues/335
		// const formatter2 = new AsYouType('VG')
		// formatter2.input('2291234').should.equal('(229) 123-4')
		// formatter2.getNumber().country.should.equal('VG')
		// formatter2.getNumber().nationalNumber.should.equal('2842291234')
		// formatter2.getNumber().number.should.equal('+12842291234')
	})

	it('should work with out-of-country dialing prefix (like 00)', () => {
		const formatter = new AsYouType('DE')
		formatter.input('00498911196611').should.equal('00 49 89 11196611')
		formatter.country.should.equal('DE')
		formatter.template.should.equal('xx xx xx xxxxxxxx')
		formatter.populatedNationalNumberTemplate.should.equal('89 11196611')
		formatter.getTemplate().should.equal('xx xx xx xxxxxxxx')
		formatter.getNumber().country.should.equal('DE')
		formatter.getNumber().nationalNumber.should.equal('8911196611')
		formatter.getNumber().number.should.equal('+498911196611')
	})

	it('shouldn\'t choose a format when there\'re too many digits for any of them', () => {
		const formatter = new AsYouType('RU')
		formatter.input('88005553535')
		formatter.chosenFormat.format().should.equal('$1 $2-$3-$4')
		formatter.reset()
		formatter.input('880055535355')
		expect(formatter.chosenFormat).to.be.undefined
	})

	it('should get separator after national prefix', () => {
		// Russia.
		// Has separator after national prefix.
		const formatter = new AsYouType('RU')
		const format = formatter.metadata.formats()[0]
		format.nationalPrefixFormattingRule().should.equal('8 ($1)')
		formatter.getSeparatorAfterNationalPrefix(format).should.equal(' ')
		// Britain.
		// Has no separator after national prefix.
		const formatter2 = new AsYouType('GB')
		const format2 = formatter2.metadata.formats()[0]
		format2.nationalPrefixFormattingRule().should.equal('0$1')
		formatter2.getSeparatorAfterNationalPrefix(format2).should.equal('')
	})

	it('should repeat string N times', () => {
		repeat('a', 0).should.equal('')
		repeat('a', 3).should.equal('aaa')
		repeat('a', 4).should.equal('aaaa')
	})

	it('should return if the number is possible', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		formatter.isPossible().should.equal(false)
		formatter.input('8')
		formatter.isPossible().should.equal(false)
		formatter.input('8005553535')
		formatter.isPossible().should.equal(true)
		formatter.input('5')
		formatter.isPossible().should.equal(false)
	})

	it('should return if the number is valid', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		formatter.isValid().should.equal(false)
		formatter.input('88005553535')
		formatter.isValid().should.equal(true)
		formatter.input('5')
		formatter.isValid().should.equal(false)
	})

	it('should return if the number is international', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		formatter.isInternational().should.equal(false)
		formatter.input('88005553535')
		formatter.isInternational().should.equal(false)
		// International. Russia.
		const formatterInt = new AsYouType()
		formatterInt.isInternational().should.equal(false)
		formatterInt.input('+')
		formatterInt.isInternational().should.equal(true)
		formatterInt.input('78005553535')
		formatterInt.isInternational().should.equal(true)
	})

	it('should return country calling code part of the number', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		expect(formatter.getCountryCallingCode()).to.be.undefined
		formatter.input('88005553535')
		expect(formatter.getCountryCallingCode()).to.be.undefined
		// International. Russia.
		const formatterInt = new AsYouType()
		expect(formatterInt.getCountryCallingCode()).to.be.undefined
		formatterInt.input('+')
		expect(formatterInt.getCountryCallingCode()).to.be.undefined
		formatterInt.input('7')
		expect(formatterInt.getCountryCallingCode()).to.equal('7')
		formatterInt.input('8005553535')
		expect(formatterInt.getCountryCallingCode()).to.equal('7')
	})

	it('should return the country of the number', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		expect(formatter.getCountry()).to.be.undefined
		formatter.input('8')
		expect(formatter.getCountry()).to.equal('RU')
		formatter.input('8005553535')
		expect(formatter.getCountry()).to.equal('RU')
		// International. Austria.
		const formatterInt = new AsYouType()
		expect(formatterInt.getCountry()).to.be.undefined
		formatterInt.input('+')
		expect(formatterInt.getCountry()).to.be.undefined
		formatterInt.input('43')
		expect(formatterInt.getCountry()).to.equal('AT')
		// International. USA.
		const formatterIntRu = new AsYouType()
		expect(formatterIntRu.getCountry()).to.be.undefined
		formatterIntRu.input('+')
		expect(formatterIntRu.getCountry()).to.be.undefined
		formatterIntRu.input('1')
		expect(formatterIntRu.getCountry()).to.be.undefined
		formatterIntRu.input('2133734253')
		expect(formatterIntRu.getCountry()).to.equal('US')
		formatterIntRu.input('1')
		expect(formatterIntRu.getCountry()).to.be.undefined
	})
})

function type(something) {
	return typeof something
}