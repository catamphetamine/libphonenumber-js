import { describe, it } from 'mocha'
import { expect } from 'chai'

import metadata from './metadata.max.json' with { type: 'json' }
import get_number_type_custom from '../../../source/legacy/getNumberType.js'

function get_number_type(...parameters)
{
	parameters.push(metadata)
	return get_number_type_custom.apply(this, parameters)
}

describe('get_number_type', () =>
{
	it('should infer phone number type MOBILE', function()
	{
		expect(get_number_type('9150000000', 'RU')).to.equal('MOBILE')
		expect(get_number_type('7912345678', 'GB')).to.equal('MOBILE')
		expect(get_number_type('91187654321', 'AR')).to.equal('MOBILE')
		// get_number_type('15123456789', 'DE').should.equal('MOBILE')
		expect(get_number_type('51234567', 'EE')).to.equal('MOBILE')
	})

	it('should infer phone number types', function()
	{
		expect(get_number_type('88005553535', 'RU')).to.equal('TOLL_FREE')
		expect(get_number_type('8005553535', 'RU')).to.equal('TOLL_FREE')
		expect(get_number_type('4957777777', 'RU')).to.equal('FIXED_LINE')
		expect(get_number_type('8030000000', 'RU')).to.equal('PREMIUM_RATE')

		expect(get_number_type('2133734253', 'US')).to.equal('FIXED_LINE_OR_MOBILE')
		expect(get_number_type('5002345678', 'US')).to.equal('PERSONAL_NUMBER')
	})

	it('should return FIXED_LINE_OR_MOBILE when there is ambiguity', () =>
	{
		// (no such country in the metadata, therefore no unit test for this `if`)
	})

	it('should work in edge cases', function()
	{
		let thrower

		// // No metadata
		// thrower = () => get_number_type_custom({ phone: '+78005553535' })
		// thrower.should.throw('`metadata` argument not passed')

		// Parsed phone number
		expect(get_number_type({ phone: '8005553535', country: 'RU' })).to.equal('TOLL_FREE')

		// Invalid phone number
		expect(type(get_number_type('123', 'RU'))).to.equal('undefined')

		// Numerical `value`
		thrower = () => get_number_type(89150000000, 'RU')
		expect(thrower).to.throw(
            'A phone number must either be a string or an object of shape { phone, [country] }.'
        )
	})
})

function type(something)
{
	return typeof something
}
