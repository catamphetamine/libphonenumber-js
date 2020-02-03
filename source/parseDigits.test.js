import parseDigits from './parseDigits'

describe('parseDigits', () => {
	it('should parse digits', () => {
		parseDigits('+٤٤٢٣٢٣٢٣٤').should.equal('442323234')
	})
})