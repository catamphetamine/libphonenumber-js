import Metadata from '../metadata'
import metadata from '../../metadata.min.json'
import extractNationalNumberFromPossiblyIncompleteNumber from './extractNationalNumberFromPossiblyIncompleteNumber'

describe('extractNationalNumberFromPossiblyIncompleteNumber', () => {
	it('should parse a carrier code when there is no national prefix transform rule', () => {
		const meta = new Metadata(metadata)
		meta.country('AU')
		extractNationalNumberFromPossiblyIncompleteNumber('18311800123', meta).should.deep.equal({
			nationalPrefix: undefined,
			carrierCode: '1831',
			nationalNumber: '1800123'
		})
	})
})