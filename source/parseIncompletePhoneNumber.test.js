import parseIncompletePhoneNumber, { parsePhoneNumberCharacter } from './parseIncompletePhoneNumber'

describe('parseIncompletePhoneNumber', () => {
	it('should parse phone number character', () => {
		// Accepts leading `+`.
		parsePhoneNumberCharacter('+').should.equal('+')

		// Doesn't accept non-leading `+`.
		expect(parsePhoneNumberCharacter('+', '+')).to.be.undefined

		// Parses digits.
		parsePhoneNumberCharacter('1').should.equal('1')

		// Parses non-European digits.
		parsePhoneNumberCharacter('٤').should.equal('4')

		// Dismisses other characters.
		expect(parsePhoneNumberCharacter('-')).to.be.undefined
	})

	it('should parse incomplete phone number', () => {
		parseIncompletePhoneNumber('').should.equal('')

		// Doesn't accept non-leading `+`.
		parseIncompletePhoneNumber('++').should.equal('+')

		// Accepts leading `+`.
		parseIncompletePhoneNumber('+7 800 555').should.equal('+7800555')

		// Parses digits.
		parseIncompletePhoneNumber('8 (800) 555').should.equal('8800555')

		// Parses non-European digits.
		parseIncompletePhoneNumber('+٤٤٢٣٢٣٢٣٤').should.equal('+442323234')
	})
})