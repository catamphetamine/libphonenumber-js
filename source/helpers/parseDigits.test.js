import { describe, it } from 'mocha'
import { expect } from 'chai'

import parseDigits from './parseDigits.js'

describe('parseDigits', () => {
	it('should parse digits', () => {
		expect(parseDigits('+٤٤٢٣٢٣٢٣٤')).to.equal('442323234')
	})
})