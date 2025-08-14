import parseIncompletePhoneNumber, { parsePhoneNumberCharacter } from '../../../../source/parseIncompletePhoneNumber.js'

describe('parseIncompletePhoneNumber', () => {
	it('should parse phone number character', () => {
		// Accepts leading `+`.
		expect(parsePhoneNumberCharacter('+')).to.equal('+')

		// Doesn't accept non-leading `+`.
		expect(parsePhoneNumberCharacter('+', '+')).to.be.undefined

		// Parses digits.
		expect(parsePhoneNumberCharacter('1')).to.equal('1')

		// Parses non-European digits.
		expect(parsePhoneNumberCharacter('٤')).to.equal('4')

		// Dismisses other characters.
		expect(parsePhoneNumberCharacter('-')).to.be.undefined
	})

	it('should parse incomplete phone number', () => {
		expect(parseIncompletePhoneNumber('')).to.equal('')

		// Doesn't accept non-leading `+`.
		expect(parseIncompletePhoneNumber('++')).to.equal('+')

		// Accepts leading `+`.
		expect(parseIncompletePhoneNumber('+7 800 555')).to.equal('+7800555')

		// Parses digits.
		expect(parseIncompletePhoneNumber('8 (800) 555')).to.equal('8800555')

		// Parses non-European digits.
		expect(parseIncompletePhoneNumber('+٤٤٢٣٢٣٢٣٤')).to.equal('+442323234')
	})
})