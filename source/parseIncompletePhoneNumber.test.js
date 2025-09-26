import parseIncompletePhoneNumber, { parsePhoneNumberCharacter } from './parseIncompletePhoneNumber.js'

describe('parseIncompletePhoneNumber', () => {
	it('should fix `for ... of` loop coverage', () => {
		// For some weird reason, "istanbul" doesn't know how to properly cover
		// a `for ... of` loop that has been transpiled with Babel.
		// For some reason, it attempts to cover the `for ... of` polyfill coode too,
		// meaning that it complains if that polyfill's edge case is not covered.
		// This test case works around that weird bug by covering that edge case of the polyfill.
		//
		// When it runs `npm test` command, it does so without `babel` transpilation,
		// so the error is gonna be "string.split is not a function or its return value is not iterable".
		//
		// When it runs `npm run test-coverage` command, it does so with `babel` transpilation,
		// so the error is gonna be "Invalid attempt to iterate non-iterable instance.".
		//
		expect(() => {
			parseIncompletePhoneNumber({
				split: () => 123
			})
		}).to.throw(/(not iterable|non-iterable)/)
	})

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

	it('should work with a new `context` argument in `parsePhoneNumberCharacter()` function (international number)', () => {
		let stopped = false

		const emit = (event) => {
			switch (event) {
				case 'end':
					stopped = true
					break
			}
		}

		expect(parsePhoneNumberCharacter('+', undefined, emit)).to.equal('+')
		expect(stopped).to.equal(false)

		expect(parsePhoneNumberCharacter('1', '+', emit)).to.equal('1')
		expect(stopped).to.equal(false)

		expect(parsePhoneNumberCharacter('+', '+1', emit)).to.be.undefined
		expect(stopped).to.equal(true)

		expect(parsePhoneNumberCharacter('2', '+1', emit)).to.equal('2')
		expect(stopped).to.equal(true)
	})

	it('should work with a new `context` argument in `parsePhoneNumberCharacter()` function (national number)', () => {
		let stopped = false

		const emit = (event) => {
			switch (event) {
				case 'end':
					stopped = true
					break
			}
		}

		expect(parsePhoneNumberCharacter('2', undefined, emit)).to.equal('2')
		expect(stopped).to.equal(false)

		expect(parsePhoneNumberCharacter('+', '2', emit)).to.be.undefined
		expect(stopped).to.equal(true)

		expect(parsePhoneNumberCharacter('1', '2', emit)).to.equal('1')
		expect(stopped).to.equal(true)
	})

	it('should call `eventListener` when the input ends abruptly', () => {
		let parsingEnded = false
		const eventListener = (event) => {
			parsingEnded = true;
			if (event !== 'end') {
				throw new Error(`Unexpected event: ${event}`)
			}
		}

		// Doesn't accept non-leading `+`.
		expect(parsePhoneNumberCharacter('+', '+123', eventListener)).to.be.undefined
		expect(parsingEnded).to.equal(true)
	})
})