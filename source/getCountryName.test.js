import metadata from '../metadata.min.json' assert { type: 'json' }

import getCountryName from './getCountryName.js'

describe('getCountryName', () => {
	it('should get country name', () => {
		getCountryName('US', metadata).should.equal('United States of America')
	})

	it('should throw if country is unknown', () => {
		expect(() => getCountryName('ZZ', metadata)).to.throw('Unknown country: ZZ')
	})
})