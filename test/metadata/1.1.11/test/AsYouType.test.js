import { describe, it } from 'mocha'
import { expect } from 'chai'

import metadata from '../metadata.min.json' with { type: 'json' }
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
		expect(new as_you_type().input('+12133734')).to.equal('+1 213 373 4')
		// Local number test
		expect(new as_you_type('US').input('2133734')).to.equal('(213) 373-4')

		// With national prefix test
		expect(new as_you_type('RU').input('88005553535')).to.equal('8 (800) 555-35-35')

		// // Should discard the national prefix
		// // when a whole phone number format matches
		// new as_you_type('RU').input('8800555353').should.equal('880 055-53-53')

		expect(new as_you_type('CH').input('044-668-1')).to.equal('044 668 1')

		let formatter

		// Test International phone number (international)

		formatter = new as_you_type()

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')
		expect(type(formatter.formatter.template)).to.equal('undefined')

		expect(formatter.input('+')).to.equal('+')

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')
		expect(type(formatter.formatter.template)).to.equal('undefined')

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
		expect(formatter.formatter.template).to.equal('xx xxx xxx xxxx')

		expect(formatter.input('5')).to.equal('+1 21333344445')

		// formatter.valid.should.be.false
		expect(type(formatter.getCountry())).to.equal('undefined')
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

		formatter = new as_you_type('CH')

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

		expect(formatter.input(' 00')).to.equal('044 668 18 00')

		// formatter.valid.should.be.true
		expect(formatter.getCountry()).to.equal('CH')
		expect(formatter.formatter.template).to.equal('xxx xxx xx xx')

		expect(formatter.input('9')).to.equal('04466818009')

		// formatter.valid.should.be.false
		expect(formatter.getCountry()).to.equal('CH')
		expect(type(formatter.formatter.template)).to.equal('undefined')

		// Kazakhstan (non-main country for +7 country phone code)

		formatter = new as_you_type()

		formatter.input('+77172580659')
		expect(formatter.getCountry()).to.equal('KZ')

		// Brazil

		// formatter = new as_you_type('BR')
		// formatter.input('11987654321').should.equal('11 98765-4321')

		// UK (Jersey) (non-main country for +44 country phone code)

		formatter = new as_you_type()
		expect(formatter.input('+447700300000')).to.equal('+44 7700 300000')
		expect(formatter.formatter.template).to.equal('xxx xxxx xxxxxx')
		expect(formatter.getCountry()).to.equal('JE')

		// Test Afghanistan phone numbers

		formatter = new as_you_type('AF')

		// // No national prefix
		// formatter.input('44444444').should.equal('44444444')
		// type(formatter.formatter.template).should.equal('undefined')

		// With national prefix
		expect(formatter.reset().input('044444444')).to.equal('044 444 444')
		expect(formatter.formatter.template).to.equal('xxx xxx xxxx')

		// Hungary (braces must be part of the template)
		formatter = new as_you_type('HU')
		expect(formatter.input('301234567')).to.equal('(30) 123 4567')
		expect(formatter.formatter.template).to.equal('(xx) xxx xxxx')

		// Test Russian phone numbers
		// (with optional national prefix `8`)

		formatter = new as_you_type('RU')

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('999')).to.equal('8 (999)')
		expect(formatter.input('-')).to.equal('8 (999)')
		expect(formatter.input('1234')).to.equal('8 (999) 123-4')
		expect(formatter.input('567')).to.equal('8 (999) 123-45-67')
		expect(formatter.input('8')).to.equal('899912345678')

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

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('999')).to.equal('8 (999)')
		expect(formatter.input('-')).to.equal('8 (999)')
		expect(formatter.input('1234')).to.equal('8 (999) 123-4')
		expect(formatter.input('567')).to.equal('8 (999) 123-45-67')
		expect(formatter.input('8')).to.equal('899912345678')

		// National prefix should not be prepended
		// when formatting local NANPA phone numbers.
		expect(new as_you_type('US').input('1')).to.equal('1')
		expect(new as_you_type('US').input('12')).to.equal('1 2')
		expect(new as_you_type('US').input('123')).to.equal('1 23')

		// Bulgaria
		// (should not prepend national prefix `0`)
		expect(new as_you_type('BG').input('111 222 3')).to.equal('1112223')

		// Brazil
		// (should not add braces around `12`
		//  because the phone number is being output in the international format)
		expect(new as_you_type().input('+55123456789')).to.equal('+55 12 3456 789')
		expect(new as_you_type('BR').input('+55123456789')).to.equal('+55 12 3456 789')
		expect(new as_you_type('BR').input('123456789')).to.equal('(12) 3456-789')

		// Deutchland
		expect(new as_you_type().input('+4915539898001')).to.equal('+49 15539 898001')

		// KZ detection
		formatter = new as_you_type()
		formatter.input('+7 702 211 1111')
		expect(formatter.getCountry()).to.equal('KZ')
		// formatter.valid.should.equal(true)

		// New Zealand formatting fix (issue #89)
		expect(new as_you_type('NZ').input('0212')).to.equal('021 2')

		// South Korea
		formatter = new as_you_type()
		expect(formatter.input('+82111111111')).to.equal('+82 11 111 1111')
		expect(formatter.formatter.template).to.equal('xxx xx xxx xxxx')
	})

	it(`should fall back to the default country`, function()
	{
		const formatter = new as_you_type('RU')

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('999')).to.equal('8 (999)')

		// formatter.valid.should.be.false
		expect(formatter.formatter.template).to.equal('x (xxx) xxx-xx-xx')
		expect(formatter.getCountry()).to.equal('RU')

		expect(formatter.input('000000000000')).to.equal('8999000000000000')

		// formatter.valid.should.be.false
		expect(type(formatter.formatter.template)).to.equal('undefined')
		expect(formatter.getCountry()).to.equal('RU')

		formatter.reset()

		// formatter.valid.should.be.false
		expect(type(formatter.formatter.template)).to.equal('undefined')
		// formatter.getCountry().should.equal('RU')

		expect(formatter.input('+1-213-373-4253')).to.equal('+1 213 373 4253')

		// formatter.valid.should.be.true
		expect(formatter.formatter.template).to.equal('xx xxx xxx xxxx')
		expect(formatter.getCountry()).to.equal('US')
	})

	it('should work in edge cases', function()
	{
		let formatter
		let thrower

		// No metadata
		thrower = () => new as_you_type_custom('RU')
		expect(thrower).to.throw('`metadata` argument not passed')

		// Second '+' sign

		formatter = new as_you_type('RU')

		expect(formatter.input('+')).to.equal('+')
		expect(formatter.input('7')).to.equal('+7')
		expect(formatter.input('+')).to.equal('+7')

		// Out-of-position '+' sign

		formatter = new as_you_type('RU')

		expect(formatter.input('8')).to.equal('8')
		expect(formatter.input('+')).to.equal('8')

		// No format matched

		formatter = new as_you_type('RU')

		expect(formatter.input('88005553535')).to.equal('8 (800) 555-35-35')
		expect(formatter.input('0')).to.equal('880055535350')

		// Invalid country phone code

		formatter = new as_you_type()

		expect(formatter.input('+0123')).to.equal('+0123')

		// No country specified and not an international number

		formatter = new as_you_type()

		expect(formatter.input('88005553535')).to.equal('88005553535')

		// Extract national prefix when no `national_prefix` is set

		formatter = new as_you_type('AD')

		expect(formatter.input('155555')).to.equal('155 555')

		// Typing nonsense

		formatter = new as_you_type('RU')

		expect(formatter.input('+1abc2')).to.equal('+1')

		// Should reset default country when explicitly
		// typing in an international phone number

		formatter = new as_you_type('RU')

		formatter.input('+')
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(type(formatter.getCountryCallingCode())).to.equal('undefined')

		// Country not inferrable from the phone number,
		// while the phone number itself can already be formatted "completely".

		formatter = new as_you_type()

		formatter.input('+12223333333')
		expect(type(formatter.getCountry())).to.equal('undefined')
		expect(formatter.getCountryCallingCode()).to.equal('1')

		// // An otherwise matching phone number format is skipped
		// // when it requires a national prefix but no national prefix was entered.
		// formatter = new as_you_type('CN')
		// formatter.input('01010000').should.equal('010 10000')
		// formatter.reset().input('1010000').should.equal('10 1000 0')

		// Reset a chosen format when it no longer holds given the new leading digits.
		// If Google changes metadata for Australia then this test might not cover the case.
		formatter = new as_you_type('AU')
		expect(formatter.input('180')).to.equal('180')
		expect(formatter.input('2')).to.equal('180 2')
	})

	it('should not accept phone number extensions', function()
	{
		expect(new as_you_type().input('+1-213-373-4253 ext. 123')).to.equal('+1 213 373 4253')
	})

	it('should parse non-European digits', function()
	{
		expect(new as_you_type().input('+١٢١٢٢٣٢٣٢٣٢')).to.equal('+1 212 232 3232')
	})
})

function type(something)
{
	return typeof something
}