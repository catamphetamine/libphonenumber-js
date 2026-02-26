import { describe, it } from 'mocha'
import { expect } from 'chai'

import metadata from '../metadata.max.json' with { type: 'json' }
import Metadata from '../../../../source/metadata.js'
import { checkNumberLengthForType } from '../../../../source/helpers/checkNumberLength.js'
import _getNumberType from '../../../../source/legacy/getNumberType.js'

function getNumberType(...parameters) {
	parameters.push(metadata)
	return _getNumberType.apply(this, parameters)
}

describe('getNumberType', () => {
	it('should infer phone number type MOBILE', () => {
		expect(getNumberType('9150000000', 'RU')).to.equal('MOBILE')
		expect(getNumberType('7912345678', 'GB')).to.equal('MOBILE')
		expect(getNumberType('51234567', 'EE')).to.equal('MOBILE')
	})

	it('should infer phone number types', () =>  {
		expect(getNumberType('88005553535', 'RU')).to.equal('TOLL_FREE')
		expect(getNumberType('8005553535', 'RU')).to.equal('TOLL_FREE')
		expect(getNumberType('4957777777', 'RU')).to.equal('FIXED_LINE')
		expect(getNumberType('8030000000', 'RU')).to.equal('PREMIUM_RATE')

		expect(getNumberType('2133734253', 'US')).to.equal('FIXED_LINE_OR_MOBILE')
		expect(getNumberType('5002345678', 'US')).to.equal('PERSONAL_NUMBER')
	})

	it('should return FIXED_LINE_OR_MOBILE when there is ambiguity', () => {
		// (no such country in the metadata, therefore no unit test for this `if`)
	})

	it('should check phone number length', () => {
		// Too short.
		expect(checkNumberLength('800555353', 'FIXED_LINE', 'RU')).to.equal('TOO_SHORT')
		// Normal.
		expect(checkNumberLength('8005553535', 'FIXED_LINE', 'RU')).to.equal('IS_POSSIBLE')
		// Too long.
		expect(checkNumberLength('80055535355', 'FIXED_LINE', 'RU')).to.equal('TOO_LONG')

		// No such type.
		expect(checkNumberLength('169454850', 'VOIP', 'AC')).to.equal('INVALID_LENGTH')
		// No such possible length.
		expect(checkNumberLength('1694548', undefined, 'AD')).to.equal('INVALID_LENGTH')

		// FIXED_LINE_OR_MOBILE
		expect(checkNumberLength('1694548', 'FIXED_LINE_OR_MOBILE', 'AD')).to.equal('INVALID_LENGTH')
		// No mobile phones.
		expect(checkNumberLength('8123', 'FIXED_LINE_OR_MOBILE', 'TA')).to.equal('IS_POSSIBLE')
		// No "possible lengths" for "mobile".
		expect(checkNumberLength('81234567', 'FIXED_LINE_OR_MOBILE', 'SZ')).to.equal('IS_POSSIBLE')
	})

	it('should work in edge cases', function() {
		let thrower

		// // No metadata
		// thrower = () => _getNumberType({ phone: '+78005553535' })
		// thrower.should.throw('`metadata` argument not passed')

		// Parsed phone number
		expect(getNumberType({ phone: '8005553535', country: 'RU' })).to.equal('TOLL_FREE')

		// Invalid phone number
		expect(type(getNumberType('123', 'RU'))).to.equal('undefined')

		// Invalid country
		thrower = () => getNumberType({ phone: '8005553535', country: 'RUS' })
		expect(thrower).to.throw('Unknown country')

		// Numerical `value`
		thrower = () => getNumberType(89150000000, 'RU')
		expect(thrower).to.throw(
            'A phone number must either be a string or an object of shape { phone, [country] }.'
        )

		// When `options` argument is passed.
		expect(getNumberType('8005553535', 'RU', {})).to.equal('TOLL_FREE')
		expect(getNumberType('+78005553535', {})).to.equal('TOLL_FREE')
		expect(getNumberType({ phone: '8005553535', country: 'RU' }, {})).to.equal('TOLL_FREE')
	})
})

function type(something) {
	return typeof something
}

function checkNumberLength(number, type, country) {
	const _metadata = new Metadata(metadata)
	_metadata.country(country)
	return checkNumberLengthForType(number, undefined, type, _metadata)
}