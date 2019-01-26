import metadata from '../metadata.full'
import Metadata from './metadata'
import { checkNumberLengthForType } from './getNumberType_'
import _getNumberType from './getNumberType'

function getNumberType(...parameters) {
	parameters.push(metadata)
	return _getNumberType.apply(this, parameters)
}

describe('getNumberType', () => {
	it('should infer phone number type MOBILE', () => {
		getNumberType('9150000000', 'RU').should.equal('MOBILE')
		getNumberType('7912345678', 'GB').should.equal('MOBILE')
		getNumberType('51234567', 'EE').should.equal('MOBILE')
	})

	it('should infer phone number types', () =>  {
		getNumberType('88005553535', 'RU').should.equal('TOLL_FREE')
		getNumberType('8005553535', 'RU').should.equal('TOLL_FREE')
		getNumberType('4957777777', 'RU').should.equal('FIXED_LINE')
		getNumberType('8030000000', 'RU').should.equal('PREMIUM_RATE')

		getNumberType('2133734253', 'US').should.equal('FIXED_LINE_OR_MOBILE')
		getNumberType('5002345678', 'US').should.equal('PERSONAL_NUMBER')
	})

	it('should return FIXED_LINE_OR_MOBILE when there is ambiguity', () => {
		// (no such country in the metadata, therefore no unit test for this `if`)
	})

	it('should check phone number length', () => {
		// Too short.
		checkNumberLength('800555353', 'FIXED_LINE', 'RU').should.equal('TOO_SHORT')
		// Normal.
		checkNumberLength('8005553535', 'FIXED_LINE', 'RU').should.equal('IS_POSSIBLE')
		// Too long.
		checkNumberLength('80055535355', 'FIXED_LINE', 'RU').should.equal('TOO_LONG')

		// No such type.
		checkNumberLength('169454850', 'VOIP', 'AC').should.equal('INVALID_LENGTH')
		// No such possible length.
		checkNumberLength('1694548', undefined, 'AD').should.equal('INVALID_LENGTH')

		// FIXED_LINE_OR_MOBILE
		checkNumberLength('1694548', 'FIXED_LINE_OR_MOBILE', 'AD').should.equal('INVALID_LENGTH')
		// No mobile phones.
		checkNumberLength('8123', 'FIXED_LINE_OR_MOBILE', 'TA').should.equal('IS_POSSIBLE')
		// No "possible lengths" for "mobile".
		checkNumberLength('81234567', 'FIXED_LINE_OR_MOBILE', 'SZ').should.equal('IS_POSSIBLE')
	})

	it('should work in edge cases', function() {
		let thrower

		// // No metadata
		// thrower = () => _getNumberType({ phone: '+78005553535' })
		// thrower.should.throw('`metadata` argument not passed')

		// Parsed phone number
		getNumberType({ phone: '8005553535', country: 'RU' }).should.equal('TOLL_FREE')

		// Invalid phone number
		type(getNumberType('123', 'RU')).should.equal('undefined')

		// Invalid country
		thrower = () => getNumberType({ phone: '8005553535', country: 'RUS' })
		thrower.should.throw('Unknown country')

		// Numerical `value`
		thrower = () => getNumberType(89150000000, 'RU')
		thrower.should.throw('A phone number must either be a string or an object of shape { phone, [country] }.')

		// When `options` argument is passed.
		getNumberType('8005553535', 'RU', {}).should.equal('TOLL_FREE')
		getNumberType('+78005553535', {}).should.equal('TOLL_FREE')
		getNumberType({ phone: '8005553535', country: 'RU' }, {}).should.equal('TOLL_FREE')
	})
})

function type(something) {
	return typeof something
}

function checkNumberLength(number, type, country) {
	const _metadata = new Metadata(metadata)
	_metadata.country(country)
	return checkNumberLengthForType(number, type, _metadata)
}