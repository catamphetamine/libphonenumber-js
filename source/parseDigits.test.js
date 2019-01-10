import parseDigits from './parseDigits'

describe('parseIncompletePhoneNumber', () => {
	it('should parse digits', () => {
		parseDigits('+٤٤٢٣٢٣٢٣٤').should.equal('442323234')
	})
})