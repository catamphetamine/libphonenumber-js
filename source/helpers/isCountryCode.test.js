import { describe, it } from 'mocha'
import { expect } from 'chai'

import isCountryCode from './isCountryCode.js'

describe('helpers/isCountryCode', () => {
	it('should determine if a string is a country code', () => {
		expect(isCountryCode('')).to.equal(false)
		expect(isCountryCode('U')).to.equal(false)
		expect(isCountryCode('US')).to.equal(true)
		expect(isCountryCode('USA')).to.equal(false)
		expect(isCountryCode('1')).to.equal(false)
	})
})