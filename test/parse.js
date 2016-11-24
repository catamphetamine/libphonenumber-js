import chai, { expect } from 'chai'
chai.should()

import parse from '../source/parse'

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
	})
})