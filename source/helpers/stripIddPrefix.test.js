import stripIddPrefix from './stripIddPrefix.js'

import metadata from '../../metadata.min.json' with { type: 'json' }

describe('stripIddPrefix', () => {
	it('should strip a valid IDD prefix', () => {
		expect(stripIddPrefix('01178005553535', 'US', '1', metadata)).to.equal('78005553535')
	})

	it('should strip a valid IDD prefix (no country calling code)', () => {
		expect(stripIddPrefix('011', 'US', '1', metadata)).to.equal('')
	})

	it('should strip a valid IDD prefix (valid country calling code)', () => {
		expect(stripIddPrefix('0117', 'US', '1', metadata)).to.equal('7')
	})

	it('should strip a valid IDD prefix (not a valid country calling code)', () => {
		expect(stripIddPrefix('0110', 'US', '1', metadata)).to.be.undefined
	})
})