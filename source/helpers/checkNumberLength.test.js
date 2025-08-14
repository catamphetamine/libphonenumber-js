import Metadata from '../metadata.js'
import metadata from '../../metadata.max.json' with { type: 'json' }
import oldMetadata from '../../test/metadata/1.0.0/metadata.min.json' with { type: 'json' }

import { checkNumberLengthForType } from './checkNumberLength.js'

describe('checkNumberLength', () => {
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

	it('should work for old metadata', function() {
		const _oldMetadata = new Metadata(oldMetadata)
		_oldMetadata.country('RU')
		expect(checkNumberLengthForType('8005553535', 'FIXED_LINE', _oldMetadata)).to.equal('IS_POSSIBLE')
	})
})

function checkNumberLength(number, type, country) {
	const _metadata = new Metadata(metadata)
	_metadata.country(country)
	return checkNumberLengthForType(number, type, _metadata)
}