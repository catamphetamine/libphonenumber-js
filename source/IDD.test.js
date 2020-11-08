import { stripIDDPrefix } from './IDD'

import metadata from '../metadata.min.json'

describe('IDD', () => {
	it('should strip a valid IDD prefix', () => {
		stripIDDPrefix('01178005553535', 'US', '1', metadata).should.equal('78005553535')
	})

	it('should strip a valid IDD prefix (no country calling code)', () => {
		stripIDDPrefix('011', 'US', '1', metadata).should.equal('')
	})

	it('should strip a valid IDD prefix (valid country calling code)', () => {
		stripIDDPrefix('0117', 'US', '1', metadata).should.equal('7')
	})

	it('should strip a valid IDD prefix (not a valid country calling code)', () => {
		expect(stripIDDPrefix('0110', 'US', '1', metadata)).to.be.undefined
	})
})