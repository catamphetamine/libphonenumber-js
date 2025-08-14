import metadata from '../metadata.min.json' with { type: 'json' }
import AsYouType_ from '../../../../source/AsYouType.js'

class AsYouType extends AsYouType_ {
	constructor(country_code) {
		super(country_code, metadata)
	}
}

describe('as you type', () => {
	it('should use "national_prefix_formatting_rule"', () => {
		// With national prefix (full).
		expect(new AsYouType('RU').input('88005553535')).to.equal('8 (800) 555-35-35')
		// With national prefix (partial).
		expect(new AsYouType('RU').input('880055535')).to.equal('8 (800) 555-35')
	})

	it('should populate national number template (digit by digit)', () => {
		const formatter = new AsYouType('US')
		formatter.input('1')
		expect(formatter.formatter.template).to.equal('x (xxx) xxx-xxxx')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 (xxx) xxx-xxxx')
		formatter.input('213')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 (213) xxx-xxxx')
		formatter.input('3734253')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 (213) 373-4253')
	})

	it('should populate national number template (attempt to format complete number)', () => {
		const formatter = new AsYouType('US')
		expect(formatter.input('12133734253')).to.equal('1 (213) 373-4253')
		expect(formatter.formatter.template).to.equal('x (xxx) xxx-xxxx')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 (213) 373-4253')
	})

	it('should parse and format phone numbers as you type', () => {
		// International number test
		expect(new AsYouType().input('+12133734')).to.equal('+1 213 373 4')
		// Local number test
		expect(new AsYouType('US').input('2133734')).to.equal('(213) 373-4')

		// US national number retains national prefix.
		expect(new AsYouType('US').input('12133734')).to.equal('1 (213) 373-4')

		// US national number retains national prefix (full number).
		expect(new AsYouType('US').input('12133734253')).to.equal('1 (213) 373-4253')

		// Doesn't discard the national prefix
		// when a whole phone number format matches
		expect(new AsYouType('RU').input('8800555353')).to.equal('8 (800) 555-35-3')

		expect(new AsYouType('CH').input('044-668-1')).to.equal('044 668 1')

		let formatter

		// Test International phone number (international)

		formatter = new AsYouType()

		// formatter.valid.should.be.false
		expect(type(formatter.country)).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')
		expect(formatter.getTemplate()).to.equal('')

		expect(formatter.input('+')).to.equal('+')

		// formatter.valid.should.be.false
		expect(type(formatter.country)).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')
		expect(formatter.getTemplate()).to.equal('x')

		expect(formatter.input('1')).to.equal('+1')

		// formatter.valid.should.be.false
		expect(type(formatter.country)).to.equal('undefined')
		expect(formatter.getCountryCallingCode()).to.equal('1')
		expect(formatter.getTemplate()).to.equal('xx')

		expect(formatter.input('2')).to.equal('+1 2')
		expect(formatter.getTemplate()).to.equal('xx x')

		// formatter.valid.should.be.false
		expect(type(formatter.country)).to.equal('undefined')

		expect(formatter.input('1')).to.equal('+1 21')
		expect(formatter.input('3')).to.equal('+1 213')
		expect(formatter.input(' ')).to.equal('+1 213')
		expect(formatter.input('3')).to.equal('+1 213 3')
		expect(formatter.input('3')).to.equal('+1 213 33')
		expect(formatter.input('3')).to.equal('+1 213 333')
		expect(formatter.input('4')).to.equal('+1 213 333 4')
		expect(formatter.input('4')).to.equal('+1 213 333 44')
		expect(formatter.input('4')).to.equal('+1 213 333 444')

		// formatter.valid.should.be.false
		expect(type(formatter.country)).to.equal('undefined')

		expect(formatter.input('4')).to.equal('+1 213 333 4444')

		// formatter.valid.should.be.true
		expect(formatter.country).to.equal('US')
		// This one below contains "punctuation spaces"
		// along with the regular spaces
		expect(formatter.formatter.template).to.equal('xx xxx xxx xxxx')

		expect(formatter.input('5')).to.equal('+1 21333344445')

		// formatter.valid.should.be.false
		expect(type(formatter.country)).to.equal('undefined')
		expect(formatter.getCountryCallingCode()).to.equal('1')
		expect(type(formatter.formatter.template)).to.equal('undefined')

		// Check that clearing an international formatter
		// also clears country metadata.

		formatter.reset()

		expect(formatter.input('+')).to.equal('+')
		expect(formatter.input('7')).to.equal('+7')
		expect(formatter.input('9')).to.equal('+7 9')
		expect(formatter.input('99 111 22 33')).to.equal('+7 999 111 22 33')

		// Test Switzerland phone numbers

		formatter = new AsYouType('CH')

		expect(formatter.input(' ')).to.equal('')
		expect(formatter.input('0')).to.equal('0')
		expect(formatter.input('4')).to.equal('04')
		expect(formatter.input(' ')).to.equal('04')
		expect(formatter.input('-')).to.equal('04')
		expect(formatter.input('4')).to.equal('044')
		expect(formatter.input('-')).to.equal('044')
		expect(formatter.input('6')).to.equal('044 6')
		expect(formatter.input('6')).to.equal('044 66')
		expect(formatter.input('8')).to.equal('044 668')
		expect(formatter.input('-')).to.equal('044 668')
		expect(formatter.input('1')).to.equal('044 668 1')
		expect(formatter.input('8')).to.equal('044 668 18')

		// formatter.valid.should.be.false
		expect(formatter.country).to.equal('CH')
		expect(formatter.formatter.template).to.equal('xxx xxx xx xx')

		expect(formatter.input(' 00')).to.equal('044 668 18 00')

		// formatter.valid.should.be.true
		expect(formatter.country).to.equal('CH')
		expect(formatter.formatter.template).to.equal('xxx xxx xx xx')

		expect(formatter.input('9')).to.equal('04466818009')

		// formatter.valid.should.be.false
		expect(formatter.country).to.equal('CH')
		expect(type(formatter.formatter.template)).to.equal('undefined')

		// Kazakhstan (non-main country for +7 country phone code)

		formatter = new AsYouType()

		formatter.input('+77172580659')
		expect(formatter.country).to.equal('KZ')

		// Brazil

		formatter = new AsYouType('BR')
		expect(formatter.input('11987654321')).to.equal('(11) 98765-4321')

		// UK (Jersey) (non-main country for +44 country phone code)

		formatter = new AsYouType()
		expect(formatter.input('+447700300000')).to.equal('+44 7700 300000')
		expect(formatter.formatter.template).to.equal('xxx xxxx xxxxxx')
		expect(formatter.country).to.equal('JE')

		// Test Afghanistan phone numbers

		formatter = new AsYouType('AF')

		// // No national prefix
		// formatter.input('44444444').should.equal('44444444')
		// type(formatter.formatter.template).should.equal('undefined')

		// With national prefix
		expect(formatter.reset().input('044444444')).to.equal('044 444 444')
		expect(formatter.formatter.template).to.equal('xxx xxx xxxx')

		// Braces must be part of the template.
		formatter = new AsYouType('RU')
		expect(formatter.input('88005553535')).to.equal('8 (800) 555-35-35')
		expect(formatter.formatter.template).to.equal('x (xxx) xxx-xx-xx')

		// Test Russian phone numbers
		// (with optional national prefix `8`)

		formatter = new AsYouType('RU')

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('9')).to.equal('8 9')
		expect(formatter.input('9')).to.equal('8 99')
		expect(formatter.input('9')).to.equal('8 (999)')
		expect(formatter.input('-')).to.equal('8 (999)')
		expect(formatter.input('1234')).to.equal('8 (999) 123-4')
		expect(formatter.input('567')).to.equal('8 (999) 123-45-67')
		expect(formatter.input('8')).to.equal('899912345678')

		// // Shouldn't strip national prefix if it is optional
		// // and if it's a valid phone number.
		// formatter = new AsYouType('RU')
		// // formatter.input('8005553535').should.equal('(800) 555-35-35')
		// formatter.input('8005553535')
		// formatter.getNationalNumber().should.equal('8005553535')

		// Check that clearing an national formatter:
		//  * doesn't clear country metadata
		//  * clears all other things

		formatter.reset()

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('9')).to.equal('8 9')
		expect(formatter.input('9')).to.equal('8 99')
		expect(formatter.input('9')).to.equal('8 (999)')
		expect(formatter.input('-')).to.equal('8 (999)')
		expect(formatter.input('1234')).to.equal('8 (999) 123-4')
		expect(formatter.input('567')).to.equal('8 (999) 123-45-67')
		expect(formatter.input('8')).to.equal('899912345678')

		// National prefix should not be prepended
		// when formatting local NANPA phone numbers.
		expect(new AsYouType('US').input('1')).to.equal('1')
		expect(new AsYouType('US').input('12')).to.equal('1 2')
		expect(new AsYouType('US').input('123')).to.equal('1 23')

		// Bulgaria
		// (should not prepend national prefix `0`)
		expect(new AsYouType('BG').input('111 222 3')).to.equal('1112223')

		// Brazil
		// (should not add braces around `12`
		//  because the phone number is being output in the international format)
		expect(new AsYouType().input('+55123456789')).to.equal('+55 12 3456 789')
		expect(new AsYouType('BR').input('+55123456789')).to.equal('+55 12 3456 789')
		expect(new AsYouType('BR').input('123456789')).to.equal('(12) 3456-789')

		// Deutchland
		expect(new AsYouType().input('+4915539898001')).to.equal('+49 15539 898001')

		// KZ detection
		formatter = new AsYouType()
		formatter.input('+7 702 211 1111')
		expect(formatter.country).to.equal('KZ')
		// formatter.valid.should.equal(true)

		// New Zealand formatting fix (issue #89)
		expect(new AsYouType('NZ').input('0212')).to.equal('021 2')

		// South Korea
		formatter = new AsYouType()
		expect(formatter.input('+82111111111')).to.equal('+82 11 111 1111')
		expect(formatter.formatter.template).to.equal('xxx xx xxx xxxx')
	})

	it('should forgive incorrect international phone numbers', () => {
		let formatter

		formatter = new AsYouType()
		expect(formatter.input('+1 1 877 215 5230')).to.equal('+1 1 877 215 5230')
		// formatter.input('+1 1 877 215 5230').should.equal('+1 18772155230')
		expect(formatter.getNationalNumber()).to.equal('8772155230')
		// formatter.getNationalNumber().should.equal('18772155230')

		formatter = new AsYouType()
		expect(formatter.input('+78800555353')).to.equal('+7 880 055 53 53')
		expect(formatter.input('5')).to.equal('+7 8 800 555 35 35')
		expect(formatter.getNationalNumber()).to.equal('8005553535')
	})

	it('should return a partial template for current value', () => {
		const asYouType = new AsYouType('US')

		expect(asYouType.input('')).to.equal('')
		expect(asYouType.getTemplate()).to.equal('')

		expect(asYouType.input('2')).to.equal('2')
		// asYouType.getTemplate().should.equal('x')
		// Doesn't format for a single digit.
		expect(asYouType.getTemplate()).to.equal('x')

		expect(asYouType.input('1')).to.equal('21')
		expect(asYouType.getTemplate()).to.equal('xx')

		expect(asYouType.input('3')).to.equal('(213)')
		expect(asYouType.getTemplate()).to.equal('(xxx)')
	})

	it(`should fall back to the default country`, () => {
		const formatter = new AsYouType('RU')

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('9')).to.equal('8 9')
		expect(formatter.input('9')).to.equal('8 99')
		expect(formatter.input('9')).to.equal('8 (999)')

		// formatter.valid.should.be.false
		expect(formatter.formatter.template).to.equal('x (xxx) xxx-xx-xx')
		expect(formatter.country).to.equal('RU')
		// formatter.getCountryCallingCode().should.equal('7')

		expect(formatter.input('000000000000')).to.equal('8999000000000000')

		// formatter.valid.should.be.false
		expect(type(formatter.formatter.template)).to.equal('undefined')
		expect(formatter.country).to.equal('RU')
		// formatter.getCountryCallingCode().should.equal('7')

		formatter.reset()

		// formatter.valid.should.be.false
		expect(type(formatter.formatter.template)).to.equal('undefined')
		expect(formatter.country).to.equal('RU')
		// formatter.getCountryCallingCode().should.equal('7')

		expect(formatter.input('+1-213-373-4253')).to.equal('+1 213 373 4253')

		// formatter.valid.should.be.true
		expect(formatter.formatter.template).to.equal('xx xxx xxx xxxx')
		expect(formatter.country).to.equal('US')
		expect(formatter.getCountryCallingCode()).to.equal('1')
	})

	it('should work in edge cases', () => {
		let formatter
		let thrower

		// No metadata
		thrower = () => new AsYouType_('RU')
		expect(thrower).to.throw('`metadata` argument not passed')

		// Second '+' sign

		formatter = new AsYouType('RU')

		expect(formatter.input('+')).to.equal('+')
		expect(formatter.input('7')).to.equal('+7')
		expect(formatter.input('+')).to.equal('+7')

		// Out-of-position '+' sign

		formatter = new AsYouType('RU')

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('+')).to.equal('8')

		// No format matched

		formatter = new AsYouType('RU')

		expect(formatter.input('88005553535')).to.equal('8 (800) 555-35-35')
		expect(formatter.input('0')).to.equal('880055535350')

		// Invalid country phone code

		formatter = new AsYouType()

		expect(formatter.input('+0123')).to.equal('+0123')

		// No country specified and not an international number

		formatter = new AsYouType()

		expect(formatter.input('88005553535')).to.equal('88005553535')

		// Extract national prefix when no `national_prefix` is set

		formatter = new AsYouType('AD')

		expect(formatter.input('155555')).to.equal('155 555')

		// Typing nonsense

		formatter = new AsYouType('RU')

		expect(formatter.input('+1abc2')).to.equal('+1')

		// Should reset default country when explicitly
		// typing in an international phone number

		formatter = new AsYouType('RU')

		formatter.input('+')
		expect(type(formatter.country)).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')

		// Country not inferrable from the phone number,
		// while the phone number itself can already be formatted "completely".

		formatter = new AsYouType()

		formatter.input('+12223333333')
		expect(type(formatter.country)).to.equal('undefined')
		expect(formatter.getCountryCallingCode()).to.equal('1')

		// // An otherwise matching phone number format is skipped
		// // when it requires a national prefix but no national prefix was entered.
		// formatter = new AsYouType('CN')
		// formatter.input('01010000').should.equal('010 10000')
		// formatter.reset().input('1010000').should.equal('10 1000 0')

		// Reset a chosen format when it no longer applies given the new leading digits.
		// If Google changes metadata for England then this test might not cover the case.
		formatter = new AsYouType('GB')
		expect(formatter.input('0845')).to.equal('0845')
		// New leading digits don't match the format previously chosen.
		// Reset the format.
		expect(formatter.input('0')).to.equal('0845 0')
	})

	it('should not accept phone number extensions', () => {
		expect(new AsYouType().input('+1-213-373-4253 ext. 123')).to.equal('+1 213 373 4253')
	})

	it('should parse non-European digits', () => {
		expect(new AsYouType().input('+١٢١٢٢٣٢٣٢٣٢')).to.equal('+1 212 232 3232')
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
		expect(phoneNumber.country).to.equal('US')
		expect(phoneNumber.countryCallingCode).to.equal('1')
		expect(phoneNumber.number).to.equal('+12133734253')
		expect(phoneNumber.nationalNumber).to.equal('2133734253')

		formatter.reset()
		formatter.input('+1-113-373-4253')

		phoneNumber = formatter.getNumber()
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.countryCallingCode).to.equal('1')

		// An incorrect NANPA international phone number.
		// (contains national prefix in an international phone number)

		formatter.reset()
		formatter.input('+1-1')

		// Before leading digits < 3 matching was implemented:
		//
		// phoneNumber = formatter.getNumber()
		// expect(phoneNumber).to.not.be.undefined
		//
		// formatter.input('1')
		// phoneNumber = formatter.getNumber()
		// expect(phoneNumber.country).to.be.undefined
		// phoneNumber.countryCallingCode.should.equal('1')
		// phoneNumber.number.should.equal('+111')
	})

	it('should work with Argentina numbers', () => {
		// The same mobile number is written differently
		// in different formats in Argentina:
		// `9` gets prepended in international format.
		const asYouType = new AsYouType('AR')
		expect(asYouType.input('+5493435551212')).to.equal('+54 9 3435 55 1212')
		asYouType.reset()
		// Digits shouldn't be changed.
		// Normally formats `034 35 15 55 1212` as `03934 35-55-1212`.
		expect(asYouType.input('0343515551212')).to.equal('03435 15-55-1212')
	})

	it('should work with Mexico numbers', () => {
		const asYouType = new AsYouType('MX')
		// Fixed line.
		expect(asYouType.input('+52(449)978-000')).to.equal('+52 449 978 000')
		expect(asYouType.input('1')).to.equal('+52 449 978 0001')
		asYouType.reset()
		expect(asYouType.input('01449978000')).to.equal('01449 978 000')
		expect(asYouType.getTemplate()).to.equal('xxxxx xxx xxx')
		expect(asYouType.input('1')).to.equal('01449 978 0001')
		expect(asYouType.getTemplate()).to.equal('xxxxx xxx xxxx')
		asYouType.reset()
		expect(asYouType.input('(449)978-000')).to.equal('449 978 000')
		expect(asYouType.getTemplate()).to.equal('xxx xxx xxx')
		expect(asYouType.input('1')).to.equal('449 978 0001')
		expect(asYouType.getTemplate()).to.equal('xxx xxx xxxx')
		// Mobile.
		// `1` is prepended before area code to mobile numbers in international format.
		asYouType.reset()
		expect(asYouType.input('+521331234567')).to.equal('+52 133 1234 567')
		expect(asYouType.getTemplate()).to.equal('xxx xxx xxxx xxx')
		// Google's `libphonenumber` seems to not able to format this type of number.
		// https://issuetracker.google.com/issues/147938979
		expect(asYouType.input('8')).to.equal('+52 133 1234 5678')
		expect(asYouType.getTemplate()).to.equal('xxx xxx xxxx xxxx')
		asYouType.reset()
		expect(asYouType.input('+52331234567')).to.equal('+52 33 1234 567')
		expect(asYouType.input('8')).to.equal('+52 33 1234 5678')
		asYouType.reset()
		expect(asYouType.input('044331234567')).to.equal('04433 1234 567')
		expect(asYouType.input('8')).to.equal('04433 1234 5678')
		asYouType.reset()
		expect(asYouType.input('045331234567')).to.equal('04533 1234 567')
		expect(asYouType.input('8')).to.equal('04533 1234 5678')
	})

	it('should not duplicate area code for certain countries', () => {
		// https://github.com/catamphetamine/libphonenumber-js/issues/318
		const asYouType = new AsYouType('VI')
		// Even though `parse("3406934")` would return a
		// "(340) 340-6934" national number, still
		// "As You Type" formatter should leave it as "(340) 6934".
		expect(asYouType.input('340693')).to.equal('(340) 693')
		expect(asYouType.input('4')).to.equal('(340) 693-4')
		expect(asYouType.input('123')).to.equal('(340) 693-4123')
	})

	it('shouldn\'t throw when passed a non-existent default country', () => {
		expect(new AsYouType('XX').input('+78005553535')).to.equal('+7 800 555 35 35')
		expect(new AsYouType('XX').input('88005553535')).to.equal('88005553535')
	})

	it('should parse carrier codes', () => {
		const formatter = new AsYouType('BR')

		formatter.input('0 15 21 5555-5555')
		let phoneNumber = formatter.getNumber()
		expect(phoneNumber.carrierCode).to.equal('15')

		formatter.reset()
		formatter.input('+1-213-373-4253')
		phoneNumber = formatter.getNumber()
		expect(phoneNumber.carrierCode).to.be.undefined
	})

	it('should format non-geographic numbering plan phone numbers', () => {
		const formatter = new AsYouType()
		expect(formatter.input('+')).to.equal('+')
		expect(formatter.input('8')).to.equal('+8')
		expect(formatter.input('7')).to.equal('+87')
		expect(formatter.input('0')).to.equal('+870')
		expect(formatter.input('7')).to.equal('+870 7')
		expect(formatter.input('7')).to.equal('+870 77')
		expect(formatter.input('3')).to.equal('+870 773')
		expect(formatter.input('1')).to.equal('+870 773 1')
		expect(formatter.input('1')).to.equal('+870 773 11')
		expect(formatter.input('1')).to.equal('+870 773 111')
		expect(formatter.input('6')).to.equal('+870 773 111 6')
		expect(formatter.input('3')).to.equal('+870 773 111 63')
		expect(formatter.input('2')).to.equal('+870 773 111 632')
	})

	it('should return PhoneNumber', () => {
		const formatter = new AsYouType('RU')
		formatter.input('+1111')
		expect(formatter.getNumber().number).to.equal('+111')
	})

	// it('shouldn\'t choose a format when there\'re too many digits for any of them', () => {
	// 	const formatter = new AsYouType('RU')
	// 	formatter.input('88005553535')
	// 	formatter.chosenFormat.format().should.equal('$1 $2-$3-$4')
	// 	formatter.reset()
	// 	formatter.input('880055535355')
	// 	expect(formatter.chosenFormat).to.be.undefined
	// })

	it('should get separator after national prefix', () => {
		// Russia.
		// Has separator after national prefix.
		const formatter = new AsYouType('RU')
		const format = formatter.metadata.formats()[0]
		expect(format.nationalPrefixFormattingRule()).to.equal('8 ($1)')
		expect(formatter.formatter.getSeparatorAfterNationalPrefix(format)).to.equal(' ')
		// Britain.
		// Has no separator after national prefix.
		const formatter2 = new AsYouType('GB')
		const format2 = formatter2.metadata.formats()[0]
		expect(format2.nationalPrefixFormattingRule()).to.equal('0$1')
		expect(formatter2.formatter.getSeparatorAfterNationalPrefix(format2)).to.equal('')
	})
})

function type(something) {
	return typeof something
}