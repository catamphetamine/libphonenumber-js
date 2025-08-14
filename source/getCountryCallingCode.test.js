import metadata from '../metadata.min.json' with { type: 'json' }

import getCountryCallingCode from './getCountryCallingCode.js'

describe('getCountryCallingCode', () => {
	it('should get country calling code', () => {
		expect(getCountryCallingCode('US', metadata)).to.equal('1')
	})

	it('should throw if country is unknown', () => {
		expect(() => getCountryCallingCode('ZZ', metadata)).to.throw('Unknown country: ZZ')
	})
})