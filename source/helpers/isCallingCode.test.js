import { describe, it } from 'mocha'
import { expect } from 'chai'

import isCallingCode from './isCallingCode.js'

describe('helpers/isCallingCode', () => {
	it('should determine if a string is a calling code', () => {
		expect(isCallingCode('')).to.equal(false)
		expect(isCallingCode('US')).to.equal(false)
		expect(isCallingCode('7')).to.equal(true)
		expect(isCallingCode('77')).to.equal(true)
		expect(isCallingCode('777')).to.equal(true)
		expect(isCallingCode('7777')).to.equal(true)
	})
})