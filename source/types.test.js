import metadata from '../metadata.full'
import get_number_type_custom, { check_number_length_for_type } from '../source/types'

function get_number_type(...parameters)
{
	parameters.push(metadata)
	return get_number_type_custom.apply(this, parameters)
}

describe('get_number_type', () =>
{
	it('should infer phone number type MOBILE', function()
	{
		get_number_type('9150000000', 'RU').should.equal('MOBILE')
		get_number_type('7912345678', 'GB').should.equal('MOBILE')
		get_number_type('91187654321', 'AR').should.equal('MOBILE')
		get_number_type('15123456789', 'DE').should.equal('MOBILE')
		get_number_type('51234567', 'EE').should.equal('MOBILE')
	})

	it('should infer phone number types', function()
	{
		get_number_type('88005553535', 'RU').should.equal('TOLL_FREE')
		get_number_type('8005553535', 'RU').should.equal('TOLL_FREE')
		get_number_type('4957777777', 'RU').should.equal('FIXED_LINE')
		get_number_type('8030000000', 'RU').should.equal('PREMIUM_RATE')

		get_number_type('2133734253', 'US').should.equal('FIXED_LINE_OR_MOBILE')
		get_number_type('5002345678', 'US').should.equal('PERSONAL_NUMBER')
	})

	it('should return FIXED_LINE_OR_MOBILE when there is ambiguity', () =>
	{
		// (no such country in the metadata, therefore no unit test for this `if`)
	})

	it('should check phone number length', function()
	{
		// Too short.
		check_number_length_for_type('800555353', 'FIXED_LINE', metadata.countries.RU).should.equal('TOO_SHORT')
		// Normal.
		check_number_length_for_type('8005553535', 'FIXED_LINE', metadata.countries.RU).should.equal('IS_POSSIBLE')
		// Too long.
		check_number_length_for_type('80055535355', 'FIXED_LINE', metadata.countries.RU).should.equal('TOO_LONG')

		// No such type.
		check_number_length_for_type('169454850', 'VOIP', metadata.countries.AC).should.equal('INVALID_LENGTH')
		// No such possible length.
		check_number_length_for_type('1694548', undefined, metadata.countries.AD).should.equal('INVALID_LENGTH')

		// FIXED_LINE_OR_MOBILE
		check_number_length_for_type('1694548', 'FIXED_LINE_OR_MOBILE', metadata.countries.AD).should.equal('INVALID_LENGTH')
		// No mobile phones.
		check_number_length_for_type('8123', 'FIXED_LINE_OR_MOBILE', metadata.countries.TA).should.equal('IS_POSSIBLE')
		// No "possible lengths" for "mobile".
		check_number_length_for_type('81234567', 'FIXED_LINE_OR_MOBILE', metadata.countries.SZ).should.equal('IS_POSSIBLE')
	})

	it('should work in edge cases', function()
	{
		// No metadata
		let thrower = () => get_number_type_custom({ phone: '+78005553535' })
		thrower.should.throw('Metadata is required')

		// Parsed phone number
		get_number_type({ phone: '8005553535', country: 'RU' }).should.equal('TOLL_FREE')

		// Invalid phone number
		type(get_number_type('123', 'RU')).should.equal('undefined')

		// Numerical `value`
		thrower = () => get_number_type(89150000000, 'RU')
		thrower.should.throw('A phone number must either be a string or an object of shape { phone, [country] }.')
	})
})

function type(something)
{
	return typeof something
}
