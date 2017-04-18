import chai, { expect } from 'chai'
chai.should()

import metadata from '../metadata.min'
import formatter from '../source/format'

function format(...parameters)
{
	parameters.push(metadata)
	return formatter.apply(this, parameters)
}

describe('format', () =>
{
	it('should work with the first object argument expanded', function()
	{
		format('+12133734253', 'National').should.equal('(213) 373-4253')
		format('2133734253', 'US', 'International').should.equal('+1 213 373 4253')
	})

	it('should format valid phone numbers', function()
	{
		// Switzerland
		format({ country: 'CH', phone: '446681800' }, 'International').should.equal('+41 44 668 18 00')
		format({ country: 'CH', phone: '446681800' }, 'International_plaintext').should.equal('+41446681800')
		format({ country: 'CH', phone: '446681800' }, 'National').should.equal('044 668 18 00')

		// France
		format({ country: 'FR', phone: '169454850' }, 'National').should.equal('01 69 45 48 50')

		// KZ
		format('+7 702 211 1111', 'National').should.deep.equal('702 211 1111')
	})

	it('should work in edge cases', function()
	{
		let thrower

		// Explicitly specified country and derived country conflict
		format('+12133734253', 'RU', 'National').should.equal('+12133734253')

		// No suitable format
		format('+121337342530', 'US', 'National').should.equal('21337342530')
		// No suitable format (leading digits mismatch)
		format('699999', 'AD', 'National').should.equal('699999')

		// No national number
		format(undefined, 'US', 'National').should.equal('')
		format(undefined, 'US', 'International').should.equal('+1')

		// No metadata for country
		format('+121337342530', 'USA', 'National').should.equal('21337342530')
		format('21337342530', 'USA', 'National').should.equal('21337342530')

		// No format type
		thrower = () => format('+123')
		thrower.should.throw('Format type argument not passed')

		// Unknown format type
		thrower = () => format('123', 'US', 'Gay')
		thrower.should.throw('Unknown format type')

		// No metadata
		thrower = () => formatter('123', 'US', 'Gay')
		thrower.should.throw('Metadata')

		// No formats
		format('012345', 'AC', 'National').should.equal('012345')
	})
})