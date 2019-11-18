import metadata from '../metadata.min.json'

import getCountries from './getCountries'

describe('getCountries', () => {
	it('should get countries list', () => {
		expect(getCountries(metadata).indexOf('RU') > 0).to.be.true;
	})
})