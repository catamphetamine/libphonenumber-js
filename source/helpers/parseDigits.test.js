import parseDigits from './parseDigits.js'

describe('parseDigits', () => {
	it('should parse digits', () => {
		expect(parseDigits('+٤٤٢٣٢٣٢٣٤')).to.equal('442323234')
	})
})