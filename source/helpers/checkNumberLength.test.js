import Metadata from '../metadata.js'
import metadata from '../../metadata.max.json' with { type: 'json' }
import oldMetadata from '../../test/metadata/1.0.0/metadata.min.json' with { type: 'json' }

import checkNumberLength, { checkNumberLengthForType } from './checkNumberLength.js'

describe('checkNumberLength', () => {
	it('should check phone number length', () => {
		// Too short.
		expect(checkNumberLengthWithCountry('800555353', 'RU', 'FIXED_LINE')).to.equal('TOO_SHORT')
		// Normal.
		expect(checkNumberLengthWithCountry('8005553535', 'RU', 'FIXED_LINE')).to.equal('IS_POSSIBLE')
		// Too long.
		expect(checkNumberLengthWithCountry('80055535355', 'RU', 'FIXED_LINE')).to.equal('TOO_LONG')

		// No such type.
		expect(checkNumberLengthWithCountry('169454850', 'AC', 'VOIP')).to.equal('INVALID_LENGTH')
		// No such possible length.
		expect(checkNumberLengthWithCountry('1694548', 'AD', undefined)).to.equal('INVALID_LENGTH')

		// FIXED_LINE_OR_MOBILE
		expect(checkNumberLengthWithCountry('1694548', 'AD', 'FIXED_LINE_OR_MOBILE')).to.equal('INVALID_LENGTH')
		// No mobile phones.
		expect(checkNumberLengthWithCountry('8123', 'TA', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE')
		// No "possible lengths" for "mobile".
		expect(checkNumberLengthWithCountry('81234567', 'SZ', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE')
	})

	it('should check phone number length (no `country` specified)', () => {
		// Too short.
		expect(checkNumberLengthWithoutCountry('800555353', 'RU', 'FIXED_LINE')).to.equal('TOO_SHORT')
		// Normal.
		expect(checkNumberLengthWithoutCountry('8005553535', 'RU', 'FIXED_LINE')).to.equal('IS_POSSIBLE')
		// Too long.
		expect(checkNumberLengthWithoutCountry('80055535355', 'RU', 'FIXED_LINE')).to.equal('TOO_LONG')

		// No such type.
		expect(checkNumberLengthWithoutCountry('169454850', 'AC', 'VOIP')).to.equal('INVALID_LENGTH')
		// No such possible length.
		expect(checkNumberLengthWithoutCountry('1694548', 'AD', undefined)).to.equal('INVALID_LENGTH')

		// FIXED_LINE_OR_MOBILE
		expect(checkNumberLengthWithoutCountry('1694548', 'AD', 'FIXED_LINE_OR_MOBILE')).to.equal('INVALID_LENGTH')
		// No mobile phones.
		expect(checkNumberLengthWithoutCountry('8123', 'TA', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE')
		// No "possible lengths" for "mobile".
		expect(checkNumberLengthWithoutCountry('81234567', 'SZ', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE')
	})

	it('should work for old metadata', function() {
		const _oldMetadata = new Metadata(oldMetadata)
		_oldMetadata.country('RU')
		expect(checkNumberLengthForType('8005553535', 'RU', 'FIXED_LINE', _oldMetadata)).to.equal('IS_POSSIBLE')
	})

	it('should work for old metadata (no `country` specified)', function() {
		const _oldMetadata = new Metadata(oldMetadata)
		_oldMetadata.country('RU')
		expect(checkNumberLengthForType('8005553535', undefined, 'FIXED_LINE', _oldMetadata)).to.equal('IS_POSSIBLE')
	})

	it('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', () => {
		const _metadata = new Metadata(metadata)
		_metadata.country('US')

		expect(checkNumberLength('3100000', undefined, _metadata)).to.equal('TOO_SHORT');
		expect(checkNumberLength('3100000', 'US', _metadata)).to.equal('TOO_SHORT');
		expect(checkNumberLength('3100000', 'CA', _metadata)).to.equal('IS_POSSIBLE');
	})
})

function checkNumberLengthWithCountry(number, country, type) {
	const _metadata = new Metadata(metadata)
	_metadata.country(country)
	return checkNumberLengthForType(number, country, type, _metadata)
}

function checkNumberLengthWithoutCountry(number, country, type) {
	const _metadata = new Metadata(metadata)
	_metadata.country(country)
	return checkNumberLengthForType(number, undefined, type, _metadata)
}