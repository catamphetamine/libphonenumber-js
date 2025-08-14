import extractNationalNumber from './extractNationalNumber.js'

import Metadata from '../metadata.js'
import oldMetadata from '../../test/metadata/1.0.0/metadata.min.json' with { type: 'json' }

describe('extractNationalNumber', function() {
	it('should extract a national number when using old metadata', function() {
		const _oldMetadata = new Metadata(oldMetadata)
		_oldMetadata.selectNumberingPlan('RU')
		expect(extractNationalNumber('88005553535', _oldMetadata)).to.deep.equal({
			nationalNumber: '8005553535',
			carrierCode: undefined
		})
	})
})