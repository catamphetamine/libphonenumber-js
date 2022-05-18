import metadata from '../metadata.min.json'
import as_you_type_custom from '../../../../source/AsYouType.js'

class as_you_type extends as_you_type_custom
{
	constructor(country_code)
	{
		super(country_code, metadata)
	}
}

describe('as you type', () =>
{
	it('should parse and format phone numbers as you type', function()
	{
		// International number test
		new as_you_type().input('+12133734').should.equal('+1 213 373 4')
		// Local number test
		new as_you_type('US').input('2133734').should.equal('(213) 373-4')

		// With national prefix test
		new as_you_type('RU').input('88005553535').should.equal('8 (800) 555-35-35')

		// // Should discard the national prefix
		// // when a whole phone number format matches
		// new as_you_type('RU').input('8800555353').should.equal('880 055-53-53')

		new as_you_type('CH').input('044-668-1').should.equal('044 668 1')

		let formatter

		// Test International phone number (international)

		formatter = new as_you_type()

		// formatter.valid.should.be.false
		type(formatter.getCountry()).should.equal('undefined')
		type(formatter.getCountryCallingCode()).should.equal('undefined')
		type(formatter.formatter.template).should.equal('undefined')

		formatter.input('+').should.equal('+')

		// formatter.valid.should.be.false
		type(formatter.getCountry()).should.equal('undefined')
		type(formatter.getCountryCallingCode()).should.equal('undefined')
		type(formatter.formatter.template).should.equal('undefined')

		formatter.input('1').should.equal('+1')

		// formatter.valid.should.be.false
		type(formatter.getCountry()).should.equal('undefined')
		formatter.getCountryCallingCode().should.equal('1')
		formatter.getTemplate().should.equal('xx')

		formatter.input('2').should.equal('+1 2')
		formatter.getTemplate().should.equal('xx x')

		// formatter.valid.should.be.false
		type(formatter.getCountry()).should.equal('undefined')

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
		type(formatter.getCountry()).should.equal('undefined')

		formatter.input('4').should.equal('+1 213 333 4444')

		// formatter.valid.should.be.true
		formatter.getCountry().should.equal('US')
		// This one below contains "punctuation spaces"
		// along with the regular spaces
		formatter.formatter.template.should.equal('xx xxx xxx xxxx')

		formatter.input('5').should.equal('+1 21333344445')

		// formatter.valid.should.be.false
		type(formatter.getCountry()).should.equal('undefined')
		formatter.getCountryCallingCode().should.equal('1')
		type(formatter.formatter.template).should.equal('undefined')

		// Check that clearing an international formatter
		// also clears country metadata.

		formatter.reset()

		formatter.input('+').should.equal('+')
		formatter.input('7').should.equal('+7')
		formatter.input('9').should.equal('+7 9')
		formatter.input('99 111 22 33').should.equal('+7 999 111 22 33')

		// Test Switzerland phone numbers

		formatter = new as_you_type('CH')

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
		formatter.getCountry().should.equal('CH')
		formatter.formatter.template.should.equal('xxx xxx xx xx')

		formatter.input(' 00').should.equal('044 668 18 00')

		// formatter.valid.should.be.true
		formatter.getCountry().should.equal('CH')
		formatter.formatter.template.should.equal('xxx xxx xx xx')

		formatter.input('9').should.equal('04466818009')

		// formatter.valid.should.be.false
		formatter.getCountry().should.equal('CH')
		type(formatter.formatter.template).should.equal('undefined')

		// Kazakhstan (non-main country for +7 country phone code)

		formatter = new as_you_type()

		formatter.input('+77172580659')
		formatter.getCountry().should.equal('KZ')

		// Brazil

		// formatter = new as_you_type('BR')
		// formatter.input('11987654321').should.equal('11 98765-4321')

		// UK (Jersey) (non-main country for +44 country phone code)

		formatter = new as_you_type()
		formatter.input('+447700300000').should.equal('+44 7700 300000')
		formatter.formatter.template.should.equal('xxx xxxx xxxxxx')
		formatter.getCountry().should.equal('JE')

		// Test Afghanistan phone numbers

		formatter = new as_you_type('AF')

		// // No national prefix
		// formatter.input('44444444').should.equal('44444444')
		// type(formatter.formatter.template).should.equal('undefined')

		// With national prefix
		formatter.reset().input('044444444').should.equal('044 444 444')
		formatter.formatter.template.should.equal('xxx xxx xxxx')

		// Hungary (braces must be part of the template)
		formatter = new as_you_type('HU')
		formatter.input('301234567').should.equal('(30) 123 4567')
		formatter.formatter.template.should.equal('(xx) xxx xxxx')

		// Test Russian phone numbers
		// (with optional national prefix `8`)

		formatter = new as_you_type('RU')

		formatter.input('8').should.equal('8')
		formatter.input('999').should.equal('8 (999)')
		formatter.input('-').should.equal('8 (999)')
		formatter.input('1234').should.equal('8 (999) 123-4')
		formatter.input('567').should.equal('8 (999) 123-45-67')
		formatter.input('8').should.equal('899912345678')

		// // Shouldn't strip national prefix if it is optional
		// // and if it's a valid phone number.
		// formatter = new as_you_type('RU')
		// // formatter.input('8005553535').should.equal('(800) 555-35-35')
		// formatter.input('8005553535')
		// formatter.getNationalNumber().should.equal('8005553535')

		// Check that clearing an national formatter:
		//  * doesn't clear country metadata
		//  * clears all other things

		formatter.reset()

		formatter.input('8').should.equal('8')
		formatter.input('999').should.equal('8 (999)')
		formatter.input('-').should.equal('8 (999)')
		formatter.input('1234').should.equal('8 (999) 123-4')
		formatter.input('567').should.equal('8 (999) 123-45-67')
		formatter.input('8').should.equal('899912345678')

		// National prefix should not be prepended
		// when formatting local NANPA phone numbers.
		new as_you_type('US').input('1').should.equal('1')
		new as_you_type('US').input('12').should.equal('1 2')
		new as_you_type('US').input('123').should.equal('1 23')

		// Bulgaria
		// (should not prepend national prefix `0`)
		new as_you_type('BG').input('111 222 3').should.equal('1112223')

		// Brazil
		// (should not add braces around `12`
		//  because the phone number is being output in the international format)
		new as_you_type().input('+55123456789').should.equal('+55 12 3456 789')
		new as_you_type('BR').input('+55123456789').should.equal('+55 12 3456 789')
		new as_you_type('BR').input('123456789').should.equal('(12) 3456-789')

		// Deutchland
		new as_you_type().input('+4915539898001').should.equal('+49 15539 898001')

		// KZ detection
		formatter = new as_you_type()
		formatter.input('+7 702 211 1111')
		formatter.getCountry().should.equal('KZ')
		// formatter.valid.should.equal(true)

		// New Zealand formatting fix (issue #89)
		new as_you_type('NZ').input('0212').should.equal('021 2')

		// South Korea
		formatter = new as_you_type()
		formatter.input('+82111111111').should.equal('+82 11 111 1111')
		formatter.formatter.template.should.equal('xxx xx xxx xxxx')
	})

	it(`should fall back to the default country`, function()
	{
		const formatter = new as_you_type('RU')

		formatter.input('8').should.equal('8')
		formatter.input('999').should.equal('8 (999)')

		// formatter.valid.should.be.false
		formatter.formatter.template.should.equal('x (xxx) xxx-xx-xx')
		formatter.getCountry().should.equal('RU')

		formatter.input('000000000000').should.equal('8999000000000000')

		// formatter.valid.should.be.false
		type(formatter.formatter.template).should.equal('undefined')
		formatter.getCountry().should.equal('RU')

		formatter.reset()

		// formatter.valid.should.be.false
		type(formatter.formatter.template).should.equal('undefined')
		// formatter.getCountry().should.equal('RU')

		formatter.input('+1-213-373-4253').should.equal('+1 213 373 4253')

		// formatter.valid.should.be.true
		formatter.formatter.template.should.equal('xx xxx xxx xxxx')
		formatter.getCountry().should.equal('US')
	})

	it('should work in edge cases', function()
	{
		let formatter
		let thrower

		// No metadata
		thrower = () => new as_you_type_custom('RU')
		thrower.should.throw('`metadata` argument not passed')

		// Second '+' sign

		formatter = new as_you_type('RU')

		formatter.input('+').should.equal('+')
		formatter.input('7').should.equal('+7')
		formatter.input('+').should.equal('+7')

		// Out-of-position '+' sign

		formatter = new as_you_type('RU')

		formatter.input('8').should.equal('8')
		formatter.input('+').should.equal('8')

		// No format matched

		formatter = new as_you_type('RU')

		formatter.input('88005553535').should.equal('8 (800) 555-35-35')
		formatter.input('0').should.equal('880055535350')

		// Invalid country phone code

		formatter = new as_you_type()

		formatter.input('+0123').should.equal('+0123')

		// No country specified and not an international number

		formatter = new as_you_type()

		formatter.input('88005553535').should.equal('88005553535')

		// Extract national prefix when no `national_prefix` is set

		formatter = new as_you_type('AD')

		formatter.input('155555').should.equal('155 555')

		// Typing nonsense

		formatter = new as_you_type('RU')

		formatter.input('+1abc2').should.equal('+1')

		// Should reset default country when explicitly
		// typing in an international phone number

		formatter = new as_you_type('RU')

		formatter.input('+')
		type(formatter.getCountry()).should.equal('undefined')
		type(formatter.getCountryCallingCode()).should.equal('undefined')

		// Country not inferrable from the phone number,
		// while the phone number itself can already be formatted "completely".

		formatter = new as_you_type()

		formatter.input('+12223333333')
		type(formatter.getCountry()).should.equal('undefined')
		formatter.getCountryCallingCode().should.equal('1')

		// // An otherwise matching phone number format is skipped
		// // when it requires a national prefix but no national prefix was entered.
		// formatter = new as_you_type('CN')
		// formatter.input('01010000').should.equal('010 10000')
		// formatter.reset().input('1010000').should.equal('10 1000 0')

		// Reset a chosen format when it no longer holds given the new leading digits.
		// If Google changes metadata for Australia then this test might not cover the case.
		formatter = new as_you_type('AU')
		formatter.input('180').should.equal('180')
		formatter.input('2').should.equal('180 2')
	})

	it('should not accept phone number extensions', function()
	{
		new as_you_type().input('+1-213-373-4253 ext. 123').should.equal('+1 213 373 4253')
	})

	it('should parse non-European digits', function()
	{
		new as_you_type().input('+١٢١٢٢٣٢٣٢٣٢').should.equal('+1 212 232 3232')
	})
})

function type(something)
{
	return typeof something
}