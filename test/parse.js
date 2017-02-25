import chai, { expect } from 'chai'
chai.should()

import metadata from '../metadata.min'
import parser, { get_number_type as get_number_type_custom } from '../source/parse'

function parse(...parameters)
{
	parameters.push(metadata)
	return parser.apply(this, parameters)
}

function get_number_type(...parameters)
{
	parameters.push(metadata)
	return get_number_type_custom.apply(this, parameters)
}

describe('parse', () =>
{
	it('should not parse invalid phone numbers', function()
	{
		parse('+7 (800) 55-35-35').should.deep.equal({})
		parse('+7 (800) 55-35-35', 'US').should.deep.equal({})
		parse('(800) 55 35 35', { country: { default: 'RU' } }).should.deep.equal({})
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
		// Restrict to US, but not a US country phone code supplied
		parse('+7 (800) 555-35-35', 'US').should.deep.equal({})
		// Restrict to RU
		parse('(800) 555 35 35', 'RU').should.deep.equal({ country: 'RU', phone: '8005553535' })
		// Default to RU
		parse('8 (800) 555 35 35', { country: { default: 'RU' } }).should.deep.equal({ country: 'RU', phone: '8005553535' })

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

		// No country metadata for this country code
		parse('123', 'ZZ').should.deep.equal({})

		// Invalid country phone code
		parse('+210').should.deep.equal({})

		// Country phone code beginning with a '0'
		parse('+0123').should.deep.equal({})

		// Barbados NANPA phone number
		parse('+12460000000').should.deep.equal({ country: 'BB', phone: '2460000000' })

		// A case when country (restricted to) is not equal
		// to the one parsed out of an international number.
		parse('+1-213-373-4253', 'RU').should.deep.equal({})

		// National (significant) number too short
		parse('2', 'US').should.deep.equal({})

		// National (significant) number too long
		parse('222222222222222222', 'US').should.deep.equal({})

		// No `national_prefix_for_parsing`
		parse('41111', 'AC').should.deep.equal({ country: 'AC', phone: '41111'})

		// National prefix transform rule (Mexico).
		// Local cell phone from a land line: 044 -> 1.
		parse('0445511111111', 'MX').should.deep.equal({ country: 'MX', phone: '15511111111' })

		// No arguments
		parse(undefined).should.deep.equal({})

		// No metadata
		thrower = () => parser('')
		thrower.should.throw('Metadata')

		// No metadata
		thrower = () => parser('', {})
		thrower.should.throw('Metadata')
	})
})

describe('get_number_type', () =>
{

	it('should infer phone number types', function()
	{
		get_number_type('8005553535', 'RU', metadata).should.equal('TOLL_FREE')
		get_number_type('4957777777', 'RU', metadata).should.equal('FIXED_LINE')
		get_number_type('9150000000', 'RU', metadata).should.equal('MOBILE')
		get_number_type('8030000000', 'RU', metadata).should.equal('PREMIUM_RATE')

		get_number_type('2133734253', 'US', metadata).should.equal('FIXED_LINE_OR_MOBILE')
		get_number_type('5002345678', 'US', metadata).should.equal('PERSONAL_NUMBER')
	})

	it('should return FIXED_LINE_OR_MOBILE when there is ambiguity', () =>
	{
		// (no such country in the metadata, therefore no unit test for this `if`)
	})
})