import _validatePhoneNumberLength from './validatePhoneNumberLength.js'
import metadata from '../metadata.min.json' with { type: 'json' }

function validatePhoneNumberLength(...parameters) {
	parameters.push(metadata)
	return _validatePhoneNumberLength.apply(this, parameters)
}

describe('validatePhoneNumberLength', () => {
	it('should detect whether a phone number length is valid', () => {
		// Not a phone number.
		expect(validatePhoneNumberLength('+')).to.equal('NOT_A_NUMBER')
		expect(validatePhoneNumberLength('abcde')).to.equal('NOT_A_NUMBER')

		// No country supplied for a national number.
		expect(validatePhoneNumberLength('123')).to.equal('INVALID_COUNTRY')

		// Too short while the number is not considered "viable"
		// by Google's `libphonenumber`.
		expect(validatePhoneNumberLength('2', 'US')).to.equal('TOO_SHORT')
		expect(validatePhoneNumberLength('+1', 'US')).to.equal('TOO_SHORT')
		expect(validatePhoneNumberLength('+12', 'US')).to.equal('TOO_SHORT')

		// Test national (significant) number length.
		expect(validatePhoneNumberLength('444 1 44', 'TR')).to.equal('TOO_SHORT')
		expect(validatePhoneNumberLength('444 1 444', 'TR')).to.be.undefined
		expect(validatePhoneNumberLength('444 1 4444', 'TR')).to.equal('INVALID_LENGTH')
		expect(validatePhoneNumberLength('444 1 4444444444', 'TR')).to.equal('TOO_LONG')
	})
})