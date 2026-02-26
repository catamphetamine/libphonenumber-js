import { describe, it } from 'mocha'
import { expect } from 'chai'

import metadata from '../metadata.min.json' with { type: 'json' }

import getCountries from './getCountries.js'

describe('getCountries', () => {
	it('should get countries list', () => {
		expect(getCountries(metadata).indexOf('RU') > 0).to.equal(true);
	})
})