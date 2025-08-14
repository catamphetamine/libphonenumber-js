import metadata from '../metadata.min.json' with { type: 'json' }
import AsYouType_ from './AsYouType.js'

class AsYouType extends AsYouType_ {
	constructor(country_code) {
		super(country_code, metadata)
	}
}

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

describe('AsYouType', () => {
	it('should use "national_prefix_formatting_rule"', () => {
		// With national prefix (full).
		expect(new AsYouType('RU').input('88005553535')).to.equal('8 (800) 555-35-35')
		// With national prefix (partial).
		expect(new AsYouType('RU').input('880055535')).to.equal('8 (800) 555-35')
	})

	it('should populate national number template (digit by digit)', () => {
		const formatter = new AsYouType('US')
		formatter.input('1')
		// formatter.formatter.template.should.equal('x (xxx) xxx-xxxx')
		expect(formatter.formatter.template).to.equal('x xxx-xxxx')
		// formatter.formatter.populatedNationalNumberTemplate.should.equal('1 (xxx) xxx-xxxx')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 xxx-xxxx')
		formatter.input('213')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 (213) xxx-xxxx')
		formatter.input('3734253')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('1 (213) 373-4253')
	})

	it('should populate international number template (digit by digit) (default country)', () => {
		const formatter = new AsYouType('US')
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.formatter.populatedNationalNumberTemplate).to.be.undefined
		expect(formatter.input('')).to.equal('')
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.formatter.populatedNationalNumberTemplate).to.be.undefined
		expect(formatter.input('+')).to.equal('+')
		expect(formatter.getTemplate()).to.equal('x')
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.formatter.populatedNationalNumberTemplate).to.be.undefined
		expect(formatter.input('1')).to.equal('+1')
		expect(formatter.getTemplate()).to.equal('xx')
		// Hasn't started formatting the phone number using the template yet.
		// formatter.formatter.template.should.equal('xx xxx xxx xxxx')
		expect(formatter.formatter.template).to.equal('xx xxx xxxx')
		// formatter.formatter.populatedNationalNumberTemplate.should.equal('xxx xxx xxxx')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('xxx xxxx')
		// Has some national number digits, starts formatting the phone number using the template.
		formatter.input('213')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('213 xxx xxxx')
		formatter.input('3734253')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('213 373 4253')
	})

	it('should populate international number template (digit by digit)', () => {
		const formatter = new AsYouType()
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.formatter.populatedNationalNumberTemplate).to.be.undefined
		expect(formatter.input('')).to.equal('')
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.formatter.populatedNationalNumberTemplate).to.be.undefined
		expect(formatter.input('+')).to.equal('+')
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.formatter.populatedNationalNumberTemplate).to.be.undefined
		expect(formatter.input('1')).to.equal('+1')
		// formatter.formatter.template.should.equal('xx xxx xxx xxxx')
		expect(formatter.formatter.template).to.equal('xx xxx xxxx')
		// Hasn't yet started formatting the phone number using the template.
		// formatter.formatter.populatedNationalNumberTemplate.should.equal('xxx xxx xxxx')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('xxx xxxx')
		// Has some national number digits, starts formatting the phone number using the template.
		formatter.input('213')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('213 xxx xxxx')
		formatter.input('3734253')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('213 373 4253')
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

		let formatter

		// // Should discard national prefix from a "complete" phone number.
		// new AsYouType('RU').input('8800555353').should.equal('880 055-53-53')

		// Shouldn't extract national prefix when inputting in international format.
		expect(new AsYouType('RU').input('+7800555353')).to.equal('+7 800 555 35 3')

		expect(new AsYouType('CH').input('044-668-1')).to.equal('044 668 1')

		// Test International phone number (international)

		formatter = new AsYouType()

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')
		expect(formatter.getTemplate()).to.equal('')

		expect(formatter.input('+')).to.equal('+')

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')
		expect(formatter.getTemplate()).to.equal('x')

		expect(formatter.input('1')).to.equal('+1')

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(formatter.getCountryCallingCode()).to.equal('1')
		expect(formatter.getTemplate()).to.equal('xx')

		expect(formatter.input('2')).to.equal('+1 2')
		expect(formatter.getTemplate()).to.equal('xx x')

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')

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
		expect(type(formatter.getCountry())).to.equal('undefined')

		expect(formatter.input('4')).to.equal('+1 213 333 4444')

		// formatter.valid.should.be.true
		expect(formatter.getCountry()).to.equal('US')
		// This one below contains "punctuation spaces"
		// along with the regular spaces
		expect(formatter.getTemplate()).to.equal('xx xxx xxx xxxx')

		expect(formatter.input('5')).to.equal('+1 21333344445')

		// formatter.valid.should.be.false
		expect(formatter.getCountry()).to.be.undefined
		expect(formatter.getCountryCallingCode()).to.equal('1')
		expect(formatter.formatter.template).to.be.undefined

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
		expect(formatter.getCountry()).to.equal('CH')
		expect(formatter.formatter.template).to.equal('xxx xxx xx xx')
		expect(formatter.getTemplate()).to.equal('xxx xxx xx')

		expect(formatter.input(' 00')).to.equal('044 668 18 00')

		// formatter.valid.should.be.true
		expect(formatter.getCountry()).to.equal('CH')
		expect(formatter.getTemplate()).to.equal('xxx xxx xx xx')

		expect(formatter.input('9')).to.equal('04466818009')

		// formatter.valid.should.be.false
		expect(formatter.getCountry()).to.equal('CH')
		expect(formatter.formatter.template).to.be.undefined

		// Kazakhstan (non-main country for +7 country phone code)

		formatter = new AsYouType()

		formatter.input('+77172580659')
		expect(formatter.getCountry()).to.equal('KZ')

		// Brazil

		formatter = new AsYouType('BR')
		expect(formatter.input('11987654321')).to.equal('(11) 98765-4321')

		// UK (Jersey) (non-main country for +44 country phone code)

		formatter = new AsYouType()
		expect(formatter.input('+447700300000')).to.equal('+44 7700 300000')
		expect(formatter.getTemplate()).to.equal('xxx xxxx xxxxxx')
		expect(formatter.getCountry()).to.equal('JE')

		// Braces must be part of the template.
		formatter = new AsYouType('RU')
		expect(formatter.input('88005553535')).to.equal('8 (800) 555-35-35')
		expect(formatter.getTemplate()).to.equal('x (xxx) xxx-xx-xx')

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

		// Shouldn't strip national prefix if it is optional
		// and if it's a valid phone number (international).
		formatter = new AsYouType('RU')
		// formatter.input('8005553535').should.equal('(800) 555-35-35')
		expect(formatter.input('+78005553535')).to.equal('+7 800 555 35 35')
		expect(formatter.getNationalNumber()).to.equal('8005553535')

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

		// Deutchland
		expect(new AsYouType().input('+4915539898001')).to.equal('+49 15539 898001')

		// KZ detection
		formatter = new AsYouType()
		formatter.input('+7 702 211 1111')
		expect(formatter.getCountry()).to.equal('KZ')
		// formatter.valid.should.equal(true)

		// New Zealand formatting fix (issue #89)
		expect(new AsYouType('NZ').input('0212')).to.equal('021 2')

		// South Korea
		formatter = new AsYouType()
		expect(formatter.input('+82111111111')).to.equal('+82 11 111 1111')
		expect(formatter.getTemplate()).to.equal('xxx xx xxx xxxx')
	})

	it('should filter out formats that require a national prefix and no national prefix has been input', () => {
		// Afghanistan.
		const formatter = new AsYouType('AF')

		// No national prefix, and national prefix is required in the format.
		// (not `"national_prefix_is_optional_when_formatting": true`)
		expect(formatter.input('44444444')).to.equal('44444444')
		expect(formatter.formatter.template).to.be.undefined

		// With national prefix
		expect(formatter.reset().input('044444444')).to.equal('044 444 444')
		expect(formatter.formatter.template).to.equal('xxx xxx xxxx')
	})

	it('should work when a digit is not a national prefix but a part of a valid national number', () => {
		// In Russia, `8` could be both a valid national prefix
		// and a part of a valid national number.
		const formatter = new AsYouType('RU')
		// The formatter could try both variants:
		// with extracting national prefix
		// and without extracting it,
		// and then choose whichever way has `this.matchingFormats`.
		// Or there could be two instances of the formatter:
		// one that extracts national prefix and one that doesn't,
		// and then the one that has `this.matchingFormats` would be
		// used to format the phone number.
		// Something like an option `extractNationalPrefix: false`
		// and creating `this.withNationalPrefixFormatter = new AsYouType(this.defaultCountry || this.defaultCallingCode, { metadata, extractNationalPrefix: false })`
		// and something like `this.withNationalPrefixFormatter.input(nextDigits)` in `input(nextDigits)`.
		// But, for this specific case, it's not required:
		// in Russia, people are used to inputting `800` numbers with national prefix `8`:
		// `8 800 555 35 35`.
		// formatter.input('8005553535').should.equal('(800) 555-35-35')
		expect(formatter.input('8005553535')).to.equal('8005553535')
		formatter.reset()
		expect(formatter.input('+78005553535')).to.equal('+7 800 555 35 35')
	})

	it('should match formats that require a national prefix and no national prefix has been input (national prefix is mandatory for a format)', () => {
		const formatter = new AsYouType('FR')
		expect(formatter.input('612345678')).to.equal('612345678')
		formatter.reset()
		expect(formatter.input('0612345678')).to.equal('06 12 34 56 78')
	})

	it('should match formats that require a national prefix and no national prefix has been input (national prefix is not mandatory for a format)', () => {
		const formatter = new AsYouType('RU')
		// Without national prefix.
		expect(formatter.input('9991234567')).to.equal('999 123-45-67')
		formatter.reset()
		// With national prefix.
		expect(formatter.input('89991234567')).to.equal('8 (999) 123-45-67')
	})

	it('should not use `national_prefix_formatting_rule` when formatting international phone numbers', () => {
		// Brazil.
		// `national_prefix_formatting_rule` is `($1)`.
		// Should not add braces around `12` when being input in international format.
		expect(new AsYouType().input('+55123456789')).to.equal('+55 12 3456 789')
		expect(new AsYouType('BR').input('+55123456789')).to.equal('+55 12 3456 789')
		expect(new AsYouType('BR').input('123456789')).to.equal('(12) 3456-789')
	})

	it('should support incorrectly entered international phone numbers (with a national prefix)', () => {
		let formatter

		formatter = new AsYouType()
		expect(formatter.input('+1 1 877 215 5230')).to.equal('+1 1 877 215 5230')
		// formatter.input('+1 1 877 215 5230').should.equal('+1 1 8772155230')
		expect(formatter.getNationalNumber()).to.equal('8772155230')

		// They've added another number format that has `8` leading digit
		// and 14 digits. Maybe it's something related to Kazakhstan.
		// formatter = new AsYouType()
		// formatter.input('+78800555353').should.equal('+7 880 055 53 53')
		// formatter.input('5').should.equal('+7 8 800 555 35 35')
		// formatter.getNationalNumber().should.equal('8005553535')
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
		expect(formatter.getCountry()).to.equal('RU')
		// formatter.getCountryCallingCode().should.equal('7')

		expect(formatter.input('000000000000')).to.equal('8999000000000000')

		// formatter.valid.should.be.false
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.getCountry()).to.equal('RU')
		// formatter.getCountryCallingCode().should.equal('7')

		formatter.reset()

		// formatter.valid.should.be.false
		expect(formatter.formatter.template).to.be.undefined
		expect(formatter.getCountry()).to.be.undefined
		// formatter.getCountryCallingCode().should.equal('7')

		expect(formatter.input('+1-213-373-4253')).to.equal('+1 213 373 4253')

		// formatter.valid.should.be.true
		expect(formatter.getTemplate()).to.equal('xx xxx xxx xxxx')
		expect(formatter.getCountry()).to.equal('US')
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
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')

		// Country not inferrable from the phone number,
		// while the phone number itself can already be formatted "completely".

		formatter = new AsYouType()

		formatter.input('+12223333333')
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(formatter.getCountryCallingCode()).to.equal('1')

		// Reset a chosen format when it no longer applies given the new leading digits.
		// If Google changes metadata for England then this test might not cover the case.
		formatter = new AsYouType('GB')
		expect(formatter.input('0845')).to.equal('0845')
		// New leading digits don't match the format previously chosen.
		// Reset the format.
		expect(formatter.input('0')).to.equal('0845 0')
	})

	it('should choose between matching formats based on the absence or presence of a national prefix', () => {
		// The first matching format:
		// {
		//    "pattern": "(\\d{2})(\\d{5,6})",
		//    "leading_digits_patterns": [
		//       "(?:10|2[0-57-9])[19]",
		//       "(?:10|2[0-57-9])(?:10|9[56])",
		//       "(?:10|2[0-57-9])(?:100|9[56])"
		//    ],
		//    "national_prefix_formatting_rule": "0$1",
		//    "format": "$1 $2",
		//    "domestic_carrier_code_formatting_rule": "$CC $FG"
		// }
		//
		// The second matching format:
		// {
		//    "pattern": "(\\d{2})(\\d{4})(\\d{4})",
		//    "leading_digits_patterns": [
		//       "10|2(?:[02-57-9]|1[1-9])",
		//       "10|2(?:[02-57-9]|1[1-9])",
		//       "10[0-79]|2(?:[02-57-9]|1[1-79])|(?:10|21)8(?:0[1-9]|[1-9])"
		//    ],
		//    "national_prefix_formatting_rule": "0$1",
		//    "national_prefix_is_optional_when_formatting": true,
		//    "format": "$1 $2 $3",
		//    "domestic_carrier_code_formatting_rule": "$CC $FG"
		// }
		//
		const formatter = new AsYouType('CN')
		// National prefix has been input.
		// Chooses the first format.
		expect(formatter.input('01010000')).to.equal('010 10000')
		formatter.reset()
		// No national prefix has been input,
		// and `national_prefix_for_parsing` not matched.
		// The first format won't match, because it doesn't have
		// `"national_prefix_is_optional_when_formatting": true`.
		// The second format will match, because it does have
		// `"national_prefix_is_optional_when_formatting": true`.
		expect(formatter.input('1010000')).to.equal('10 1000 0')
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

		// After leading digits < 3 matching was implemented:
		//
		phoneNumber = formatter.getNumber()
		expect(phoneNumber).to.be.undefined
		//
		formatter.input('1')
		phoneNumber = formatter.getNumber()
		expect(phoneNumber.country).to.be.undefined
		expect(phoneNumber.countryCallingCode).to.equal('1')
		expect(phoneNumber.number).to.equal('+11')
	})

	it('should work with countries that add digits to national (significant) number', () => {
		// When formatting Argentinian mobile numbers in international format,
		// a `9` is prepended, when compared to national format.
		const asYouType = new AsYouType('AR')
		expect(asYouType.input('+5493435551212')).to.equal('+54 9 3435 55 1212')
		asYouType.reset()
		// Digits shouldn't be changed when formatting in national format.
		// (no `9` is prepended).
		// First parses national (significant) number by prepending `9` to it
		// and stripping `15` from it.
		// Then uses `$2 15-$3-$4` format that strips the leading `9`
		// and adds `15`.
		expect(asYouType.input('0343515551212')).to.equal('03435 15-55-1212')
	})

	it('should return non-formatted phone number when no format matches and national (significant) number has digits added', () => {
		// When formatting Argentinian mobile numbers in international format,
		// a `9` is prepended, when compared to national format.
		const asYouType = new AsYouType('AR')
		// Digits shouldn't be changed when formatting in national format.
		// (no `9` is prepended).
		// First parses national (significant) number by prepending `9` to it
		// and stripping `15` from it.
		// Then uses `$2 15-$3-$4` format that strips the leading `9`
		// and adds `15`.
		// `this.nationalSignificantNumberMatchesInput` is `false` in this case,
		// so `getNonFormattedNumber()` returns `getFullNumber(getNationalDigits())`.
		expect(asYouType.input('0343515551212999')).to.equal('0343515551212999')
	})

	it('should format Argentina numbers (starting with 011) (digit by digit)', () => {
		// Inputting a number digit-by-digit and as a whole a two different cases
		// in case of this library compared to Google's `libphonenumber`
		// that always inputs a number digit-by-digit.
		// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/23
		// nextDigits 0111523456789
		// nationalNumber 91123456789
		const formatter = new AsYouType('AR')
		expect(formatter.input('0')).to.equal('0')
		expect(formatter.getTemplate()).to.equal('x')
		expect(formatter.input('1')).to.equal('01')
		expect(formatter.getTemplate()).to.equal('xx')
		expect(formatter.input('1')).to.equal('011')
		expect(formatter.getTemplate()).to.equal('xxx')
		expect(formatter.input('1')).to.equal('011 1')
		expect(formatter.getTemplate()).to.equal('xxx x')
		expect(formatter.input('5')).to.equal('011 15')
		expect(formatter.getTemplate()).to.equal('xxx xx')
		expect(formatter.input('2')).to.equal('011 152')
		expect(formatter.getTemplate()).to.equal('xxx xxx')
		expect(formatter.input('3')).to.equal('011 1523')
		expect(formatter.getTemplate()).to.equal('xxx xxxx')
		expect(formatter.input('4')).to.equal('011 1523-4')
		expect(formatter.getTemplate()).to.equal('xxx xxxx-x')
		expect(formatter.input('5')).to.equal('011 1523-45')
		expect(formatter.getTemplate()).to.equal('xxx xxxx-xx')
		expect(formatter.input('6')).to.equal('011 1523-456')
		expect(formatter.getTemplate()).to.equal('xxx xxxx-xxx')
		expect(formatter.input('7')).to.equal('011 1523-4567')
		expect(formatter.getTemplate()).to.equal('xxx xxxx-xxxx')
		expect(formatter.input('8')).to.equal('011152345678')
		expect(formatter.getTemplate()).to.equal('xxxxxxxxxxxx')
		expect(formatter.input('9')).to.equal('011 15-2345-6789')
		expect(formatter.getTemplate()).to.equal('xxx xx-xxxx-xxxx')
		// Private property (not public API).
		expect(formatter.state.nationalSignificantNumber).to.equal('91123456789')
		// Private property (not public API).
		// `formatter.digits` is not always `formatter.nationalPrefix`
		// plus `formatter.nationalNumberDigits`.
		expect(formatter.state.nationalPrefix).to.equal('0')
		expect(formatter.isPossible()).to.equal(true)
		expect(formatter.isValid()).to.equal(true)
	})

	it('should format Argentina numbers (starting with 011)', () => {
		// Inputting a number digit-by-digit and as a whole a two different cases
		// in case of this library compared to Google's `libphonenumber`
		// that always inputs a number digit-by-digit.
		// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/23
		// nextDigits 0111523456789
		// nationalNumber 91123456789
		const formatter = new AsYouType('AR')
		expect(formatter.input('0111523456789')).to.equal('011 15-2345-6789')
		// Private property (not public API).
		expect(formatter.state.nationalSignificantNumber).to.equal('91123456789')
		// Private property (not public API).
		// `formatter.digits` is not always `formatter.nationalPrefix`
		// plus `formatter.nationalNumberDigits`.
		expect(formatter.state.nationalPrefix).to.equal('0')
		// expect(formatter.nationalPrefix).to.be.undefined
		expect(formatter.isPossible()).to.equal(true)
		expect(formatter.isValid()).to.equal(true)
	})

	// https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/93
	it('should format Indonesian numbers', () => {
		const formatter = new AsYouType('ID')
		expect(formatter.getChars()).to.equal('')
		// Before leading digits < 3 matching was implemented:
		// formatter.input('081').should.equal('(081)')
		// After leading digits < 3 matching was implemented:
		expect(formatter.input('081')).to.equal('081')
	})

	it('should prepend `complexPrefixBeforeNationalSignificantNumber` (not a complete number)', () => {
		// A country having `national_prefix_for_parsing` with a "capturing group".
		// National prefix is either not used in a format or is optional.
		// Input phone number without a national prefix.
		const formatter = new AsYouType('AU')
		expect(formatter.input('1831130345678')).to.equal('1831 1303 456 78')
		// Private property (not public API).
		expect(formatter.state.nationalSignificantNumber).to.equal('130345678')
		// Private property (not public API).
		// `formatter.digits` is not always `formatter.nationalPrefix`
		// plus `formatter.nationalNumberDigits`.
		expect(formatter.state.nationalPrefix).to.be.undefined
		expect(formatter.state.complexPrefixBeforeNationalSignificantNumber).to.equal('1831')
	})

	it('should prepend `complexPrefixBeforeNationalSignificantNumber` (complete number)', () => {
		// A country having `national_prefix_for_parsing` with a "capturing group".
		// National prefix is either not used in a format or is optional.
		// Input phone number without a national prefix.
		const formatter = new AsYouType('AU')
		expect(formatter.input('18311303456789')).to.equal('1831 1303 456 789')
		// Private property (not public API).
		expect(formatter.state.nationalSignificantNumber).to.equal('1303456789')
		// Private property (not public API).
		// `formatter.digits` is not always `formatter.nationalPrefix`
		// plus `formatter.nationalNumberDigits`.
		expect(formatter.state.nationalPrefix).to.be.undefined
		expect(formatter.state.complexPrefixBeforeNationalSignificantNumber).to.equal('1831')
	})

	it('should work with Mexico numbers', () => {
		const asYouType = new AsYouType('MX')

		// Fixed line. International.
		expect(asYouType.input('+52(449)978-000')).to.equal('+52 449 978 000')
		expect(asYouType.input('1')).to.equal('+52 449 978 0001')
		asYouType.reset()

		// "Dialling tokens 01, 02, 044, 045 and 1 are removed as they are
		//  no longer valid since August 2019."
		// // Fixed line. National. With national prefix "01".
		// asYouType.input('01449978000').should.equal('01449 978 000')
		// asYouType.getTemplate().should.equal('xxxxx xxx xxx')
		// asYouType.input('1').should.equal('01449 978 0001')
		// asYouType.getTemplate().should.equal('xxxxx xxx xxxx')
		// asYouType.reset()

		// Fixed line. National. Without national prefix.
		expect(asYouType.input('(449)978-000')).to.equal('449 978 000')
		expect(asYouType.getTemplate()).to.equal('xxx xxx xxx')
		expect(asYouType.input('1')).to.equal('449 978 0001')
		expect(asYouType.getTemplate()).to.equal('xxx xxx xxxx')
		asYouType.reset()

		// Mobile.
		expect(asYouType.input('+52331234567')).to.equal('+52 33 1234 567')
		expect(asYouType.input('8')).to.equal('+52 33 1234 5678')
		asYouType.reset()

		// "Dialling tokens 01, 02, 044, 045 and 1 are removed as they are
		//  no longer valid since August 2019."
		// // Mobile.
		// // With `1` prepended before area code to mobile numbers in international format.
		// asYouType.input('+521331234567').should.equal('+52 133 1234 567')
		// asYouType.getTemplate().should.equal('xxx xxx xxxx xxx')
		// // Google's `libphonenumber` seems to not able to format this type of number.
		// // https://issuetracker.google.com/issues/147938979
		// asYouType.input('8').should.equal('+52 133 1234 5678')
		// asYouType.getTemplate().should.equal('xxx xxx xxxx xxxx')
		// asYouType.reset()
		//
		// // Mobile. National. With "044" prefix.
		// asYouType.input('044331234567').should.equal('04433 1234 567')
		// asYouType.input('8').should.equal('04433 1234 5678')
		// asYouType.reset()
		//
		// // Mobile. National. With "045" prefix.
		// asYouType.input('045331234567').should.equal('04533 1234 567')
		// asYouType.input('8').should.equal('04533 1234 5678')
	})

	it('should just prepend national prefix if national_prefix_formatting_rule does not produce a suitable number', () => {
		// "national_prefix": "8"
		// "national_prefix_for_parsing": "0|80?"
		const formatter = new AsYouType('BY')
		// "national_prefix_formatting_rule": "8 $1"
		// That `national_prefix_formatting_rule` isn't used
		// because the user didn't input national prefix `8`.
		expect(formatter.input('0800123')).to.equal('0 800 123')
		expect(formatter.getTemplate()).to.equal('x xxx xxx')
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

	it('should format when default country calling code is configured', () => {
		const formatter = new AsYouType({ defaultCallingCode: '7' })
		expect(formatter.input('88005553535')).to.equal('8 (800) 555-35-35')
		expect(formatter.getNumber().countryCallingCode).to.equal('7')
		expect(formatter.getNumber().country).to.equal('RU')
	})

	it('shouldn\'t return PhoneNumber if country calling code hasn\'t been input yet', () => {
		const formatter = new AsYouType()
		formatter.input('+80')
		expect(formatter.getNumber()).to.be.undefined
	})

	it('should format non-geographic numbering plan phone numbers', () => {
		const formatter = new AsYouType()
		expect(formatter.input('+')).to.equal('+')
		expect(formatter.input('8')).to.equal('+8')
		expect(formatter.input('7')).to.equal('+87')
		expect(formatter.getCountry()).to.be.undefined
		expect(formatter.input('0')).to.equal('+870')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			expect(formatter.getCountry()).to.equal('001')
		} else {
			expect(formatter.getCountry()).to.be.undefined
		}
		expect(formatter.input('7')).to.equal('+870 7')
		expect(formatter.input('7')).to.equal('+870 77')
		expect(formatter.input('3')).to.equal('+870 773')
		expect(formatter.input('1')).to.equal('+870 773 1')
		expect(formatter.input('1')).to.equal('+870 773 11')
		expect(formatter.input('1')).to.equal('+870 773 111')
		expect(formatter.input('6')).to.equal('+870 773 111 6')
		expect(formatter.input('3')).to.equal('+870 773 111 63')
		expect(formatter.input('2')).to.equal('+870 773 111 632')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			expect(formatter.getNumber().country).to.equal('001')
		} else {
			expect(formatter.getCountry()).to.be.undefined
		}
		expect(formatter.getNumber().countryCallingCode).to.equal('870')
	})

	it('should format non-geographic numbering plan phone numbers (default country calling code)', () => {
		const formatter = new AsYouType({ defaultCallingCode: '870' })
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			expect(formatter.getNumber().country).to.equal('001')
		} else {
			expect(formatter.getCountry()).to.be.undefined
		}
		expect(formatter.input('7')).to.equal('7')
		expect(formatter.input('7')).to.equal('77')
		expect(formatter.input('3')).to.equal('773')
		expect(formatter.input('1')).to.equal('773 1')
		expect(formatter.input('1')).to.equal('773 11')
		expect(formatter.input('1')).to.equal('773 111')
		expect(formatter.input('6')).to.equal('773 111 6')
		expect(formatter.input('3')).to.equal('773 111 63')
		expect(formatter.input('2')).to.equal('773 111 632')
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			expect(formatter.getNumber().country).to.equal('001')
		} else {
			expect(formatter.getCountry()).to.be.undefined
		}
		expect(formatter.getNumber().countryCallingCode).to.equal('870')
	})

	it('should not format non-geographic numbering plan phone numbers (default country 001)', () => {
		const formatter = new AsYouType('001')
		expect(formatter.defaultCountry).to.be.undefined
		expect(formatter.defaultCallingCode).to.be.undefined
		expect(formatter.input('7')).to.equal('7')
		expect(formatter.input('7')).to.equal('77')
		expect(formatter.input('3')).to.equal('773')
		expect(formatter.input('1')).to.equal('7731')
		expect(formatter.input('1')).to.equal('77311')
		expect(formatter.input('1')).to.equal('773111')
		expect(formatter.input('6')).to.equal('7731116')
		expect(formatter.input('3')).to.equal('77311163')
		expect(formatter.input('2')).to.equal('773111632')
		expect(formatter.getCountry()).to.be.undefined
		expect(formatter.getNumber()).to.be.undefined
	})

	it('should return PhoneNumber (should strip national prefix `1` in E.164 value)', () => {
		const formatter = new AsYouType('RU')
		formatter.input('+1111')
		expect(formatter.getNumber().number).to.equal('+111')
	})

	it('should return PhoneNumber with autocorrected international numbers without leading +', () => {
		// https://github.com/catamphetamine/libphonenumber-js/issues/316
		const formatter = new AsYouType('FR')
		expect(formatter.input('33612902554')).to.equal('33 6 12 90 25 54')
		expect(formatter.getNumber().country).to.equal('FR')
		expect(formatter.getNumber().nationalNumber).to.equal('612902554')
		expect(formatter.getNumber().number).to.equal('+33612902554')
		// Should also strip national prefix.
		formatter.reset()
		expect(formatter.input('330612902554')).to.equal('33 06 12 90 25 54')
		expect(formatter.getNumber().country).to.equal('FR')
		expect(formatter.getNumber().nationalNumber).to.equal('612902554')
		expect(formatter.getNumber().number).to.equal('+33612902554')
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
		expect(formatter.input('00498911196611')).to.equal('00 49 89 11196611')
		expect(formatter.getCountry()).to.equal('DE')
		expect(formatter.formatter.template).to.equal('xx xx xx xxxxxxxx')
		expect(formatter.formatter.populatedNationalNumberTemplate).to.equal('89 11196611')
		expect(formatter.getTemplate()).to.equal('xx xx xx xxxxxxxx')
		expect(formatter.getNumber().country).to.equal('DE')
		expect(formatter.getNumber().nationalNumber).to.equal('8911196611')
		expect(formatter.getNumber().number).to.equal('+498911196611')
	})

	it('shouldn\'t choose a format when there\'re too many digits for any of them', () => {
		const formatter = new AsYouType('RU')
		formatter.input('89991112233')
		expect(formatter.formatter.chosenFormat.format()).to.equal('$1 $2-$3-$4')
		formatter.reset()
		formatter.input('899911122334')
		expect(formatter.formatter.chosenFormat).to.be.undefined
	})

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

	it('should return if the number is possible', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		expect(formatter.isPossible()).to.equal(false)
		formatter.input('8')
		expect(formatter.isPossible()).to.equal(false)
		formatter.input('8005553535')
		expect(formatter.isPossible()).to.equal(true)
		formatter.input('5')
		expect(formatter.isPossible()).to.equal(false)
	})

	it('should return if the number is valid', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		expect(formatter.isValid()).to.equal(false)
		formatter.input('88005553535')
		expect(formatter.isValid()).to.equal(true)
		formatter.input('5')
		expect(formatter.isValid()).to.equal(false)
	})

	it('should return if the number is international', () => {
		// National. Russia.
		const formatter = new AsYouType('RU')
		expect(formatter.isInternational()).to.equal(false)
		formatter.input('88005553535')
		expect(formatter.isInternational()).to.equal(false)
		// International. Russia.
		const formatterInt = new AsYouType()
		expect(formatterInt.isInternational()).to.equal(false)
		formatterInt.input('+')
		expect(formatterInt.isInternational()).to.equal(true)
		formatterInt.input('78005553535')
		expect(formatterInt.isInternational()).to.equal(true)
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

	it('should parse a long IDD prefix', () => {
		const formatter = new AsYouType('AU')
		// `14880011` is a long IDD prefix in Australia.
		expect(formatter.input('1')).to.equal('1')
		expect(formatter.input('4')).to.equal('14')
		expect(formatter.input('8')).to.equal('148')
		expect(formatter.input('8')).to.equal('1488')
		expect(formatter.input('0')).to.equal('14880')
		expect(formatter.input('0')).to.equal('148800')
		expect(formatter.input('1')).to.equal('1488001')
		expect(formatter.input('1')).to.equal('14880011')
		// As if were calling US using `14880011` IDD prefix,
		// though that prefix could mean something else.
		expect(formatter.input('1')).to.equal('14880011 1')
		expect(formatter.input('2')).to.equal('14880011 1 2')
		expect(formatter.input('1')).to.equal('14880011 1 21')
		expect(formatter.input('3')).to.equal('14880011 1 213')
	})

	it('should return the phone number characters entered by the user', () => {
		const formatter = new AsYouType('RU')
		expect(formatter.getChars()).to.equal('')
		formatter.input('+123')
		expect(formatter.getChars()).to.equal('+123')
		formatter.reset()
		formatter.input('123')
		expect(formatter.getChars()).to.equal('123')
	})

	// A test confirming the case when input `"11"` for country `"US"`
	// produces `value` `"+11"`.
	// https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/113
	it('should determine the national (significant) part correctly when input with national prefix in US', () => {
		const formatter = new AsYouType('US')
		// As soon as the user has input `"11"`, no `format` matches
		// those "national number" digits in the `"US"` country metadata.
		// Since no `format` matches, the number doesn't seem like a valid one,
		// so it attempts to see if the user "forgot" to input a `"+"` at the start.
		// And it looks like they might've to.
		// So it acts as if the leading `"+"` is there,
		// as if the user's input is `"+11"`.
		// See `AsYouType.fixMissingPlus()` function.
		expect(formatter.input('1 122 222 2222 3')).to.equal('1 1 222 222 2223')
		expect(formatter.getNumber().nationalNumber).to.equal('2222222223')
	})
})

describe('AsYouType.getNumberValue()', () => {
	it('should return E.164 number value (national number, with national prefix, default country: US)', () => {
		const formatter = new AsYouType('US')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (national number, with national prefix, default calling code: 1)', () => {
		const formatter = new AsYouType({ defaultCallingCode: '1' })
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (national number, default country: US)', () => {
		const formatter = new AsYouType('US')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (national number, default calling code: 1)', () => {
		const formatter = new AsYouType({ defaultCallingCode: '1' })
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (international number, not a valid calling code)', () => {
		const formatter = new AsYouType()
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('+')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('2150')
		expect(formatter.getNumberValue()).to.equal('+2150')
	})

	it('should return E.164 number value (international number, default country: US)', () => {
		const formatter = new AsYouType('US')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('+')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (international number, other default country: RU)', () => {
		const formatter = new AsYouType('RU')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('+')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (international number, default calling code: 1)', () => {
		const formatter = new AsYouType('US', { defaultCallingCode: '1' })
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('+')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (international number, other default calling code: 7)', () => {
		const formatter = new AsYouType('US', { defaultCallingCode: '7' })
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('+')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (international number)', () => {
		const formatter = new AsYouType()
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('+')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+1')
		formatter.input('2')
		expect(formatter.getNumberValue()).to.equal('+12')
		formatter.input('1')
		expect(formatter.getNumberValue()).to.equal('+121')
		formatter.input('3')
		expect(formatter.getNumberValue()).to.equal('+1213')
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.equal('+12133734253')
		formatter.input('4')
		expect(formatter.getNumberValue()).to.equal('+121337342534')
	})

	it('should return E.164 number value (national number) (no default country or calling code)', () => {
		const formatter = new AsYouType()
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('1')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('12')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('3')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('373-4253')
		expect(formatter.getNumberValue()).to.be.undefined
		formatter.input('4')
		expect(formatter.getNumberValue()).to.be.undefined
	})

	it('should not drop any input digits', () => {
		// Test "+529011234567" number, proactively ensuring that no formatting is applied,
		// where a format is chosen that would otherwise have led to some digits being dropped.
		const formatter = new AsYouType('MX')
		expect(formatter.input('9')).to.equal('9')
		expect(formatter.input('0')).to.equal('90')
		expect(formatter.input('1')).to.equal('901')
		expect(formatter.input('1')).to.equal('901 1')
		expect(formatter.input('2')).to.equal('901 12')
		expect(formatter.input('3')).to.equal('901 123')
		expect(formatter.input('4')).to.equal('901 123 4')
		expect(formatter.input('5')).to.equal('901 123 45')
		expect(formatter.input('6')).to.equal('901 123 456')
		expect(formatter.input('7')).to.equal('901 123 4567')
	})

	it('should work for formats with no leading digits (`leadingDigitsPatternsCount === 0`)', function() {
		const formatter = new AsYouType({
			defaultCallingCode: 888
		})
		expect(formatter.input('1')).to.equal('1')
	})

	it('should work for SK phone numbers', function() {
		// There was a bug: "leading digits" `"2"` matched "leading digits pattern" `"90"`.
		// The incorrect `.match()` function result was `{ oveflow: true }`
		// while it should've been `undefined`.
		// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/66
		const formatter = new AsYouType('SK')
		expect(formatter.input('090')).to.equal('090')
		formatter.reset()
		expect(formatter.input('080')).to.equal('080')
		formatter.reset()
		expect(formatter.input('059')).to.equal('059')
	})

	it('should work for SK phone numbers (2)', function() {
		// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/69
		const formatter = new AsYouType('SK')
		expect(formatter.input('421901222333')).to.equal('421 901 222 333')
		expect(formatter.getTemplate()).to.equal('xxx xxx xxx xxx')
	})

	it('should not choose `defaultCountry` over the "main" one when both the `defaultCountry` and the "main" one match the phone number', function() {
		// This phone number matches both US and CA because they have the same
		// regular expression for some weird reason.
		// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/103
		const formatter = new AsYouType('CA')
		formatter.input('8004001000')
		expect(formatter.getNumber().country).not.to.equal('CA')
		expect(formatter.getNumber().country).to.equal('US')

		// This phone number is specific to CA.
		const formatter2 = new AsYouType('US')
		formatter2.input('4389999999')
		expect(formatter2.getNumber().country).to.equal('CA')

		// This phone number doesn't belong neither to CA nor to US.
		// In fact, it doesn't belong to any country from the "NANPA" zone.
		const formatter3 = new AsYouType('US')
		formatter3.input('1111111111')
		expect(formatter3.getNumber().country).to.equal('US')
	})
})

function type(something) {
	return typeof something
}